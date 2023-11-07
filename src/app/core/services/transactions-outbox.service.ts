import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DateService } from './date.service';
import { Observable, from, noop } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TransactionService } from './transaction.service';
import { FileService } from './file.service';
import { StatusService } from './status.service';
import { cloneDeep, indexOf } from 'lodash';
import { ReportService } from './report.service';
import { ParsedReceipt } from '../models/parsed_receipt.model';
import { TrackingService } from './tracking.service';
import { Expense } from '../models/expense.model';
import { CurrencyService } from './currency.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { Transaction } from '../models/v1/transaction.model';
import { FileObject } from '../models/file-obj.model';
import { OutboxQueue } from '../models/outbox-queue.model';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { SnackbarPropertiesService } from './snackbar-properties.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TransactionsOutboxService {
  queue: OutboxQueue[] = [];

  syncDeferred: Promise<void> = null;

  syncInProgress = false;

  dataExtractionQueue: OutboxQueue[] = [];

  tempQueue;

  ROOT_ENDPOINT: string;

  //Used for showing bulk mode prompt when instafyle is used more than thrice in the same session
  singleCaptureCountInSession = 0;

  constructor(
    private storageService: StorageService,
    private dateService: DateService,
    private transactionService: TransactionService,
    private fileService: FileService,
    private statusService: StatusService,
    private httpClient: HttpClient,
    private reportService: ReportService,
    private trackingService: TrackingService,
    private currencyService: CurrencyService,
    private orgUserSettingsService: OrgUserSettingsService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService,
    private router: Router
  ) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
    this.restoreQueue();
  }

  get singleCaptureCount(): number {
    return this.singleCaptureCountInSession;
  }

  incrementSingleCaptureCount(): void {
    this.singleCaptureCountInSession++;
  }

  setRoot(rootUrl: string): void {
    this.ROOT_ENDPOINT = rootUrl;
  }

  showSnackBarToast(
    toastMessageData: { message: string; redirectionText?: string },
    type: 'success' | 'information' | 'failure',
    panelClass: string[]
  ): MatSnackBarRef<ToastMessageComponent> {
    return this.matSnackBar.openFromComponent(ToastMessageComponent, {
      ...this.snackbarProperties.setSnackbarProperties(type, toastMessageData),
      panelClass,
    });
  }

  showAddToReportSuccessToast(reportId: string, message: string): void {
    const toastMessageData = {
      message,
      redirectionText: 'View Report',
    };
    const expensesAddedToReportSnackBar = this.showSnackBarToast(toastMessageData, 'success', [
      'msb-success-with-camera-icon',
    ]) as {
      onAction: () => Observable<unknown>;
    };

    this.trackingService.showToastMessage({ ToastContent: toastMessageData.message });

    expensesAddedToReportSnackBar.onAction().subscribe(() => {
      this.router.navigate(['/', 'enterprise', 'my_view_report', { id: reportId, navigateBack: true }]);
    });
  }

  formatToastMessage(reportId: string, entry: OutboxQueue): void {
    if (entry.transaction.org_category?.toLowerCase() === 'per diem') {
      this.showAddToReportSuccessToast(reportId, 'Per Diem expense added to report successfully');
      this.trackingService.showToastMessage({
        ToastContent: 'Per Diem expense added to report successfully',
      });
    } else if (entry.transaction.org_category?.toLowerCase() === 'mileage') {
      this.showAddToReportSuccessToast(reportId, 'Mileage expense added to report successfully');
      this.trackingService.showToastMessage({
        ToastContent: 'Mileage expense added to report successfully',
      });
    } else {
      this.showAddToReportSuccessToast(reportId, 'Expense added to report successfully');
      this.trackingService.showToastMessage({ ToastContent: 'Expense added to report successfully' });
    }
  }

  async saveQueue(): Promise<void> {
    await this.storageService.set('outbox', this.queue);
  }

  async saveDataExtractionQueue(): Promise<void> {
    await this.storageService.set('data_extraction_queue', this.dataExtractionQueue);
  }

  async removeDataExtractionEntry(
    expense: Partial<Transaction>,
    dataUrls: { url: string; type: string }[]
  ): Promise<void> {
    const entry = {
      transaction: expense,
      dataUrls,
    };

    const idx = this.dataExtractionQueue.indexOf(entry);
    this.dataExtractionQueue.splice(idx, 1);
    await this.saveDataExtractionQueue();
  }

  async restoreQueue(): Promise<void> {
    this.queue = await this.storageService.get('outbox');
    this.dataExtractionQueue = await this.storageService.get('data_extraction_queue');

    if (!this.queue) {
      this.queue = [];
    }

    if (!this.dataExtractionQueue) {
      this.dataExtractionQueue = [];
    }

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.queue.length; i++) {
      const entry = this.queue[i];
      // In localStorage the date objects are stored as string, have to convert them to date instance
      entry.transaction = this.dateService.fixDates(entry.transaction);
    }

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.dataExtractionQueue.length; i++) {
      const entry = this.dataExtractionQueue[i];
      // In localStorage the date objects are stored as string, have to convert them to date instance
      entry.transaction = this.dateService.fixDates(entry.transaction);
    }
  }

  async addDataExtractionEntry(
    transaction: Partial<Transaction>,
    dataUrls: { url: string; type: string }[]
  ): Promise<void> {
    this.dataExtractionQueue.push({
      transaction,
      dataUrls,
    });
    await this.saveDataExtractionQueue();
  }

  async processDataExtractionEntry(): Promise<void> {
    const that = this;
    const clonedQueue = cloneDeep(this.dataExtractionQueue);

    if (clonedQueue.length > 0) {
      // calling data_extraction serially for all expenses in queue.
      // https://gist.github.com/steve-taylor/5075717
      const loop = (index: number): void => {
        const entry = clonedQueue[index];

        const base64Image = entry.dataUrls[0].url.replace('data:image/jpeg;base64,', '');

        that
          .parseReceipt(base64Image)
          .then(
            (response) => {
              const parsedResponse = response.data;

              if (parsedResponse) {
                const extractedData = {
                  amount: parsedResponse.amount,
                  currency: parsedResponse.currency,
                  category: parsedResponse.category,
                  date: parsedResponse.date ? new Date(parsedResponse.date) : null,
                  vendor: parsedResponse.vendor_name,
                };

                entry.transaction.extracted_data = extractedData;
                entry.transaction.txn_dt = new Date();

                // TODO: add this to allow amout addtion to extracted expense
                // let transactionUpsertPromise;

                // if (!entry.transaction.amount) {
                //   transactionUpsertPromise = that
                //     .getExtractedCurrencyData(extractedData, entry)
                //     .then((_) => that.transactionService.upsert(entry.transaction).toPromise());
                // } else {
                //   transactionUpsertPromise = that.transactionService.upsert(entry.transaction).toPromise();
                // }

                that.transactionService
                  .upsert(entry.transaction)
                  .toPromise()
                  .then(() => null)
                  .finally(() => {
                    this.removeDataExtractionEntry(entry.transaction, entry.dataUrls);
                  });
              } else {
                this.removeDataExtractionEntry(entry.transaction, entry.dataUrls);
              }
            },
            () => {
              this.removeDataExtractionEntry(entry.transaction, entry.dataUrls);
            }
          )
          .finally(() => {
            // iterating to next item on list.
            if (index < clonedQueue.length - 1) {
              loop(index + 1);
            }
          });
      };

      loop(0);
    }
  }

  uploadData(uploadUrl: string, blob, contentType: string): Observable<null> {
    return this.httpClient.put<null>(uploadUrl, blob, {
      headers: new HttpHeaders({ 'Content-Type': contentType }),
    });
  }

  async fileUpload(dataUrl: string, fileType: string, receiptCoordinates?: string): Promise<FileObject> {
    return new Promise((resolve, reject) => {
      let fileExtension = fileType;
      let contentType = 'application/pdf';

      if (fileType === 'image') {
        fileExtension = 'jpeg';
        contentType = 'image/jpeg';
      }

      this.fileService
        .post({
          name: '000.' + fileExtension,
          receipt_coordinates: receiptCoordinates,
        })
        .toPromise()
        .then((fileObj: FileObject) =>
          this.fileService
            .uploadUrl(fileObj.id)
            .toPromise()
            .then((url) => {
              const uploadUrl = url;
              // check from here
              fetch(dataUrl)
                .then((res) => res.blob())
                .then((blob) => {
                  this.uploadData(uploadUrl, blob, contentType)
                    .toPromise()
                    .then(() => resolve(fileObj))
                    .catch((err) => {
                      reject(err);
                    });
                });
            })
        )
        .catch((err) => {
          reject(err);
        });
    });
  }

  removeEntry(entry: OutboxQueue): void {
    const idx = this.queue.indexOf(entry);
    this.queue.splice(idx, 1);
    this.saveQueue();
  }

  // TODO: High impact area. Fix later
  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  addEntry(
    transaction: Partial<Transaction>,
    dataUrls: { url: string; type: string }[],
    comments?: string[],
    reportId?: string,
    applyMagic = false
  ): Promise<void> {
    this.queue.push({
      transaction,
      dataUrls,
      comments,
      reportId,
      applyMagic: !!applyMagic,
    });

    return this.saveQueue();
  }

  // TODO: High impact area. Fix later
  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  addEntryAndSync(
    transaction: Partial<Transaction>,
    dataUrls: { url: string; type: string }[],
    comments: string[],
    reportId: string,
    applyMagic = false
  ): Promise<OutboxQueue> {
    this.addEntry(transaction, dataUrls, comments, reportId, applyMagic);
    return this.syncEntry(this.queue.pop());
  }

  getPendingTransactions(): Partial<Transaction>[] {
    return this.queue.map((entry) => ({ ...entry.transaction, dataUrls: entry.dataUrls }));
  }

  deleteOfflineExpense(index: number): null {
    this.queue.splice(index, 1);
    this.saveQueue();
    return null;
  }

  deleteBulkOfflineExpenses(pendingTransactions: Partial<Expense>[], deleteExpenses: Partial<Expense>[]): void {
    const indexes = deleteExpenses.map((offlineExpense) => indexOf(pendingTransactions, offlineExpense));
    // We need to delete last element of this list first
    indexes.sort((a, b) => b - a);
    indexes.forEach((index) => {
      this.deleteOfflineExpense(index);
    });
  }

  matchIfRequired(transactionId: string, cccId: string): Promise<null> {
    return new Promise((resolve) => {
      if (cccId) {
        this.transactionService
          .matchCCCExpense(transactionId, cccId)
          .toPromise()
          .then(() => {
            resolve(null);
          });
      } else {
        resolve(null);
      }
    });
  }

  syncEntry(entry: OutboxQueue): Promise<OutboxQueue> {
    const that = this;
    const fileObjPromiseArray: Promise<FileObject>[] = [];
    const reportId = entry.reportId;

    if (!entry.fileUploadCompleted) {
      if (entry.dataUrls && entry.dataUrls.length > 0) {
        entry.dataUrls.forEach((dataUrl) => {
          const fileObjPromise = that.fileUpload(dataUrl.url, dataUrl.type, dataUrl.receiptCoordinates);

          fileObjPromiseArray.push(fileObjPromise);
        });
      }
    }

    return new Promise((resolve, reject) => {
      const fileUploadsPromise = Promise.all(fileObjPromiseArray)
        .then((val) => val)
        .catch((err) => {
          reject(err);
          throw err;
        });
      that.transactionService
        .createTxnWithFiles(entry.transaction, from(fileUploadsPromise))
        .toPromise()
        .then((resp) => {
          const comments = entry.comments;
          // adding created transaction id into entry object to get created transaction id when promise is resolved.
          entry.transaction.id = resp.id;
          entry.fileUploadCompleted = true;
          if (comments && comments.length > 0) {
            comments.forEach((comment) => {
              that.statusService.post('transactions', resp.id, { comment }, true).subscribe(noop);
            });
          }
          if (entry.dataUrls && entry.dataUrls.length > 0) {
            that.transactionService
              .getETxnUnflattened(resp.id)
              .toPromise()
              .then((etxn) => {
                entry.dataUrls.forEach((dataUrl) => {
                  if (dataUrl.callBackUrl) {
                    that.httpClient.post(dataUrl.callBackUrl, {
                      entered_data: {
                        amount: etxn.tx.amount,
                        currency: etxn.tx.currency,
                        orig_currency: etxn.tx.orig_currency,
                        orig_amount: etxn.tx.orig_amount,
                        date: etxn.tx.txn_dt,
                        vendor: etxn.tx.vendor,
                        category: etxn.tx.fyle_category,
                        external_id: etxn.tx.external_id,
                        transaction_id: etxn.tx.id,
                      },
                    });
                  }
                });
              });
          }

          if (entry.applyMagic) {
            const isInstafyleEnabled$ = this.orgUserSettingsService
              .get()
              .pipe(
                map(
                  (orgUserSettings) =>
                    orgUserSettings.insta_fyle_settings.allowed && orgUserSettings.insta_fyle_settings.enabled
                )
              );

            isInstafyleEnabled$.subscribe((isInstafyleEnabled) => {
              if (isInstafyleEnabled) {
                that.addDataExtractionEntry(resp, entry.dataUrls);
              }
            });
          }

          that
            .matchIfRequired(resp.id, entry.transaction.matchCCCId)
            .then(() => {
              that.removeEntry(entry);
              if (reportId) {
                const txnIds = [resp.id];
                that.reportService
                  .addTransactions(reportId, txnIds)
                  .toPromise()
                  .then(() => {
                    this.formatToastMessage(reportId, entry);
                    this.trackingService.addToExistingReportAddEditExpense();
                    resolve(entry);
                  })
                  .catch((err: Error) => {
                    this.trackingService.syncError({ label: err });
                    reject(err);
                  });
              } else {
                resolve(entry);
              }
            })
            .catch((err: Error) => {
              this.trackingService.syncError({ label: err });
              reject(err);
            });
        })
        .catch((err: Error) => {
          this.trackingService.syncError({ label: err });
          reject(err);
        });
    });
  }

  sync(): Promise<void> {
    const that = this;

    if (that.syncDeferred) {
      return that.syncDeferred;
    }

    that.syncInProgress = true;
    that.syncDeferred = new Promise((resolve, reject) => {
      const p = [];

      for (let i = 0; i < that.queue.length; i++) {
        p.push(that.syncEntry(that.queue[i]));
      }

      Promise.all(p)
        .then(() => {
          // if (p.length > 0) {
          //   TransactionService.deleteCache();
          // }
          that.processDataExtractionEntry();
          resolve();
        })
        .catch((err) => {
          reject(err);
        })
        .finally(() => {
          that.syncDeferred = null;
          that.syncInProgress = false;
        });
    });

    return this.syncDeferred.then(() => Promise.resolve());
  }

  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  parseReceipt(data: string, fileType?: string): Promise<ParsedReceipt> {
    const url = this.ROOT_ENDPOINT + '/data_extractor/extract';
    let suggestedCurrency: string = null;
    const fileName = fileType && fileType === 'pdf' ? '000.pdf' : '000.jpeg';

    // send homeCurrency of the user's org as suggestedCurrency for data-extraction
    return this.currencyService
      .getHomeCurrency()
      .toPromise()
      .then((homeCurrency) => {
        suggestedCurrency = homeCurrency;
        return this.httpClient
          .post(url, {
            files: [
              {
                name: fileName,
                content: data,
              },
            ],
            suggested_currency: suggestedCurrency,
          })
          .toPromise()
          .then((res) => res as ParsedReceipt);
      })
      .catch(() =>
        this.httpClient
          .post(url, {
            files: [
              {
                name: fileName,
                content: data,
              },
            ],
            suggested_currency: suggestedCurrency,
          })
          .toPromise()
          .then((res) => res as ParsedReceipt)
      );
  }

  isDataExtractionPending(txnId: string): boolean {
    const txnIds = this.dataExtractionQueue.map((entry) => entry.transaction.id);

    return txnIds.indexOf(txnId) > -1;
  }

  isPDF(type: string): boolean {
    return ['application/pdf', 'pdf'].indexOf(type) > -1;
  }
}
