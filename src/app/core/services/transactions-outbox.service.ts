import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DateService } from './date.service';
import { from, noop } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class TransactionsOutboxService {
  queue = [];

  syncDeferred: Promise<any> = null;

  syncInProgress = false;

  dataExtractionQueue = [];

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
    private orgUserSettingsService: OrgUserSettingsService
  ) {
    this.ROOT_ENDPOINT = environment.ROOT_URL;
    this.restoreQueue();
  }

  get singleCaptureCount(): number {
    return this.singleCaptureCountInSession;
  }

  incrementSingleCaptureCount() {
    this.singleCaptureCountInSession++;
  }

  setRoot(rootUrl: string) {
    this.ROOT_ENDPOINT = rootUrl;
  }

  async saveQueue() {
    await this.storageService.set('outbox', this.queue);
  }

  async saveDataExtractionQueue() {
    await this.storageService.set('data_extraction_queue', this.dataExtractionQueue);
  }

  async removeDataExtractionEntry(expense, dataUrls) {
    const entry = {
      transaction: expense,
      dataUrls,
    };

    const idx = this.dataExtractionQueue.indexOf(entry);
    this.dataExtractionQueue.splice(idx, 1);
    await this.saveDataExtractionQueue();
  }

  async restoreQueue() {
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

  async addDataExtractionEntry(transaction, dataUrls) {
    this.dataExtractionQueue.push({
      transaction,
      dataUrls,
    });
    await this.saveDataExtractionQueue();
  }

  async processDataExtractionEntry() {
    const that = this;
    const clonedQueue = cloneDeep(this.dataExtractionQueue);

    if (clonedQueue.length > 0) {
      // calling data_extraction serially for all expenses in queue.
      // https://gist.github.com/steve-taylor/5075717
      const loop = (index) => {
        const entry = clonedQueue[index];

        const base64Image = entry.dataUrls[0].url.replace('data:image/jpeg;base64,', '');

        that
          .parseReceipt(base64Image)
          .then(
            (response: any) => {
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
                  .then(() => {})
                  .finally(() => {
                    this.removeDataExtractionEntry(entry.transaction, entry.dataUrls);
                  });
              } else {
                this.removeDataExtractionEntry(entry.transaction, entry.dataUrls);
              }
            },
            (err) => {
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

  uploadData(uploadUrl, blob, contentType) {
    return this.httpClient.put<any>(uploadUrl, blob, {
      headers: new HttpHeaders({ 'Content-Type': contentType }),
    });
  }

  async fileUpload(dataUrl, fileType, receiptCoordinates?) {
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
        .then((fileObj) =>
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
                    .then((_) => this.fileService.uploadComplete(fileObj.id).toPromise())
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

  removeEntry(entry) {
    const idx = this.queue.indexOf(entry);
    this.queue.splice(idx, 1);
    this.saveQueue();
  }

  // TODO: High impact area. Fix later
  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  addEntry(transaction, dataUrls, comments?, reportId?, applyMagic = false) {
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
  addEntryAndSync(transaction, dataUrls, comments, reportId, applyMagic = false) {
    this.addEntry(transaction, dataUrls, comments, reportId, applyMagic);
    return this.syncEntry(this.queue.pop());
  }

  getPendingTransactions() {
    return this.queue.map((entry) => ({ ...entry.transaction, dataUrls: entry.dataUrls }));
  }

  deleteOfflineExpense(index: number) {
    this.queue.splice(index, 1);
    this.saveQueue();
    return null;
  }

  deleteBulkOfflineExpenses(pendingTransactions: Expense[], deleteExpenses: Expense[]) {
    const indexes = deleteExpenses.map((offlineExpense) => indexOf(pendingTransactions, offlineExpense));
    // We need to delete last element of this list first
    indexes.sort((a, b) => b - a);
    indexes.forEach((index) => {
      this.deleteOfflineExpense(index);
    });
  }

  matchIfRequired(transactionId: string, cccId: string) {
    return new Promise((resolve, reject) => {
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

  syncEntry(entry) {
    const that = this;
    const fileObjPromiseArray = [];
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
                    this.trackingService.addToExistingReportAddEditExpense();
                    resolve(entry);
                  })
                  .catch((err) => {
                    this.trackingService.syncError({ label: err });
                    reject(err);
                  });
              } else {
                resolve(entry);
              }
            })
            .catch((err) => {
              this.trackingService.syncError({ label: err });
              reject(err);
            });
        })
        .catch((err) => {
          this.trackingService.syncError({ label: err });
          reject(err);
        });
    });
  }

  sync() {
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
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        })
        .finally(() => {
          that.syncDeferred = null;
          that.syncInProgress = false;
        });
    });

    return this.syncDeferred.then(() => {});
  }

  isSyncInProgress() {
    return this.syncInProgress;
  }

  parseReceipt(data, fileType?): Promise<ParsedReceipt> {
    const url = this.ROOT_ENDPOINT + '/data_extractor/extract';
    let suggestedCurrency = null;
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
      .catch((err) =>
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
