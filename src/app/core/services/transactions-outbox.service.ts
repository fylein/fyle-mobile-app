import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { DateService } from './date.service';
import { Observable, from, noop } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TransactionService } from './transaction.service';
import { indexOf } from 'lodash';
import { ParsedReceipt } from '../models/parsed_receipt.model';
import { TrackingService } from './tracking.service';
import { Expense } from '../models/expense.model';
import { CurrencyService } from './currency.service';
import { Transaction } from '../models/v1/transaction.model';
import { FileObject } from '../models/file-obj.model';
import { OutboxQueue } from '../models/outbox-queue.model';
import { ParsedResponse } from '../models/parsed_response.model';
import { SpenderFileService } from './platform/v1/spender/file.service';
import { PlatformFile } from '../models/platform/platform-file.model';
import { ExpenseCommentService } from './platform/v1/spender/expense-comment.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionsOutboxService {
  queue: OutboxQueue[] = [];

  syncDeferred: Promise<void> = null;

  syncInProgress = false;

  ROOT_ENDPOINT: string;

  //Used for showing bulk mode prompt when instafyle is used more than thrice in the same session
  singleCaptureCountInSession = 0;

  constructor(
    private storageService: StorageService,
    private dateService: DateService,
    private transactionService: TransactionService,
    private httpClient: HttpClient,
    private trackingService: TrackingService,
    private currencyService: CurrencyService,
    private spenderFileService: SpenderFileService,
    private expenseCommentService: ExpenseCommentService
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

  async saveQueue(): Promise<void> {
    await this.storageService.set('outbox', this.queue);
  }

  async restoreQueue(): Promise<void> {
    this.queue = await this.storageService.get('outbox');

    if (!this.queue) {
      this.queue = [];
    }

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.queue.length; i++) {
      const entry = this.queue[i];
      // In localStorage the date objects are stored as string, have to convert them to date instance
      entry.transaction = this.dateService.fixDates(entry.transaction);
    }
  }

  getExpenseDate(entry: OutboxQueue, extractedData: ParsedResponse): Date {
    if (entry.transaction.txn_dt) {
      return new Date(entry.transaction.txn_dt);
    } else if (extractedData.date) {
      return new Date(extractedData.date);
    } else {
      return new Date();
    }
  }

  uploadData(uploadUrl: string, blob, contentType: string): Observable<null> {
    return this.httpClient.put<null>(uploadUrl, blob, {
      headers: new HttpHeaders({ 'Content-Type': contentType }),
    });
  }

  async fileUpload(dataUrl: string, fileType: string): Promise<FileObject> {
    return new Promise((resolve, reject) => {
      let fileExtension = fileType;
      let contentType = 'application/pdf';

      if (fileType === 'image') {
        fileExtension = 'jpeg';
        contentType = 'image/jpeg';
      }

      this.spenderFileService
        .createFile({
          name: '000.' + fileExtension,
          type: 'RECEIPT',
        })
        .toPromise()
        .then((fileObj: PlatformFile) => {
          const uploadUrl = fileObj.upload_url;
          // check from here
          return fetch(dataUrl)
            .then((res) => res.blob())
            .then((blob) =>
              this.uploadData(uploadUrl, blob, contentType)
                .toPromise()
                .then(() => resolve(fileObj))
                .catch((err) => {
                  reject(err);
                })
            );
        })
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
    comments?: string[]
  ): Promise<void> {
    this.queue.push({
      transaction,
      dataUrls,
      comments,
    });

    return this.saveQueue();
  }

  // TODO: High impact area. Fix later
  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  addEntryAndSync(
    transaction: Partial<Transaction>,
    dataUrls: { url: string; type: string }[],
    comments: string[]
  ): Promise<OutboxQueue> {
    this.addEntry(transaction, dataUrls, comments);
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
          .matchCCCExpense(cccId, transactionId)
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

    if (!entry.fileUploadCompleted) {
      if (entry.dataUrls && entry.dataUrls.length > 0) {
        entry.dataUrls.forEach((dataUrl) => {
          const fileObjPromise = that.fileUpload(dataUrl.url, dataUrl.type);

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
            const commentsWithExpenseId = comments.map((comment) => ({
              id: resp.id,
              comment,
              notify: true,
            }));
            that.expenseCommentService.post(commentsWithExpenseId).subscribe(noop);
          }

          that
            .matchIfRequired(resp.id, entry.transaction.matchCCCId)
            .then(() => {
              that.removeEntry(entry);
              resolve(entry);
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

  isPDF(type: string): boolean {
    return ['application/pdf', 'pdf'].indexOf(type) > -1;
  }
}
