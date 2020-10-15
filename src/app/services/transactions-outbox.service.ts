import { Injectable } from '@angular/core';
import { StorageService } from '../core/services/storage.service';
import { DateService } from '../core/services/date.service';
import { from, empty, EMPTY, forkJoin, noop, concat } from 'rxjs';
import { concatMap, switchMap, map, catchError, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { OfflineService } from '../core/services/offline.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TransactionService } from '../core/services/transaction.service';
import { FileService } from './file.service';
import { UtilityService } from './utility.service';
import { StatusService } from './status.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionsOutboxService {
  queue = [];
  syncDeferred = null;
  syncInProgress = false;
  dataExtractionQueue = [];
  tempQueue;
  constructor(
    private storageService: StorageService,
    private dateService: DateService,
    private httpClient: HttpClient,
    private offlineService: OfflineService,
    private transactionService: TransactionService,
    private utilityService: UtilityService,
    private fileService: FileService,
    private statusService: StatusService
  ) {
    from(this.restoreQueue()).subscribe(noop);
  }


  saveQueue() {
    return from(this.storageService.set('outbox', this.queue));
  }

  saveDataExtractionQueue() {
    return from(this.storageService.set('data_extraction_queue', this.dataExtractionQueue));
  }

  removeDataExtractionEntry(expense, dataUrls) {
    const entry = {
      transaction: expense,
      dataUrls
    };

    const idx = this.dataExtractionQueue.indexOf(entry);
    this.dataExtractionQueue.splice(idx, 1);
    return this.saveDataExtractionQueue();
  }

  restoreQueue() {
    const queue$ = from(this.storageService.get('outbox'));
    const dataExtractionQueue$ = from(this.storageService.get('data_extraction_queue'));

    return forkJoin({
      queue: queue$,
      dataExtractionQueue: dataExtractionQueue$
    }).pipe(
      map(({ queue, dataExtractionQueue }) => {
        this.queue = queue;
        this.dataExtractionQueue = dataExtractionQueue;

        if (!this.queue) {
          this.queue = [];
        }

        if (!this.dataExtractionQueue) {
          this.dataExtractionQueue = [];
        }

        this.queue = this.queue.map(entry => {
          // In localStorage the date objects are stored as string, have to convert them to date instance
          entry.transaction = this.dateService.fixDates(entry.transaction);
          return entry;
        });

        this.dataExtractionQueue = this.dataExtractionQueue.map(entry => {
          // In localStorage the date objects are stored as string, have to convert them to date instance
          entry.transaction = this.dateService.fixDates(entry.transaction);
          return entry;
        });
        return {
          queue: this.queue,
          dataExtractionQueue: this.dataExtractionQueue
        };
      })
    );
  }

  addDataExtractionEntry(transaction, dataUrls) {
    this.dataExtractionQueue.push({
      transaction,
      dataUrls
    });
    return from(this.saveDataExtractionQueue());
  }

  extractData(data, suggestedCurrency) {
    return this.httpClient.post(environment.ROOT_URL + '/data_extraction/extract', {
      files: [{
        name: '000.jpeg',
        content: data
      }],
      suggested_currency: suggestedCurrency
    }, {
      headers: new HttpHeaders({ timeout: `${15000}` })
    }).pipe(
      map((res: any) => res.data)
    );
  }

  parseReceipt(data) {
    return this.offlineService.getHomeCurrency().pipe(
      catchError(err => null),
      switchMap((homeCurrency) => {
        return this.extractData(data, homeCurrency);
      }),
    );
  }

  processDataExtractionEntry() {
    const clonedQueue = [...this.dataExtractionQueue];

    if (clonedQueue.length > 0) {
      // calling data_extraction serially for all expenses in queue.
      // https://gist.github.com/steve-taylor/5075717
      return from(clonedQueue).pipe(
        concatMap((entry) => {
          const base64Image = entry.dataUrls[0].url.replace('data:image/jpeg;base64,', '');
          return this.parseReceipt(base64Image).pipe(
            concatMap((res: any) => {
              const parsedResponse = res.data;
              if (parsedResponse) {
                const extractedData = {
                  amount: parsedResponse.amount,
                  currency: parsedResponse.currency,
                  category: parsedResponse.category,
                  date: parsedResponse.date ? new Date(parsedResponse.date) : null,
                  vendor: parsedResponse.vendor
                };

                entry.transaction.extracted_data = extractedData;
                entry.transaction.txn_dt = new Date();
                return this.transactionService.upsert(entry.transaction);
              }
            }),
            finalize(() => from(this.removeDataExtractionEntry(entry.transaction, entry.dataUrls)))
          );
        })
      );
    } else {
      return EMPTY;
    }
  }

  uploadData(uploadUrl, blob, contentType) {
    return this.httpClient.put<any>(uploadUrl, blob, {
      headers: new HttpHeaders({ 'Content-Type': contentType })
    });
  }

  fileUpload(dataUrl, fileType, receiptCoordinates) {
    let fileExtension = fileType;
    let contentType = 'application/pdf';

    if (fileType === 'image') {
      fileExtension = 'jpeg';
      contentType = 'image/jpeg';
    }

    return this.fileService.post({
      name: '000.' + fileExtension,
      receipt_coordinates: receiptCoordinates
    }).pipe(
      concatMap((fileObj: any) => {
        return forkJoin({
          uploadUrl: this.fileService.uploadUrl(fileObj.id),
          blob: from(fetch(dataUrl).then(res => res.blob()))
        }).pipe(
          concatMap(({ uploadUrl, blob }) => {
            return this.uploadData(uploadUrl, blob, contentType);
          })
        );
      }),
      concatMap((fileObj) => {
        return this.fileService.uploadComplete(fileObj.id).pipe(
          map(() => fileObj)
        );
      })
    );
  }

  removeEntry(entry) {
    const idx = this.queue.indexOf(entry);
    this.queue.splice(idx, 1);
    return this.saveQueue();
  }

  addEntry(transaction, dataUrls, comments, reportId, applyMagic, receiptsData) {
    this.queue.push({
      transaction,
      dataUrls,
      comments,
      reportId,
      applyMagic: !!applyMagic,
      receiptsData
    });

    return this.saveQueue();
  }

  // addEntryAndSync(transaction, dataUrls, comments, reportId, applyMagic, receiptsData) {
  //   return this.addEntry(transaction, dataUrls, comments, reportId, applyMagic, receiptsData).pipe(
  //     switchMap(() => {
  //       return this.syncEntry(this.queue.pop());
  //     })
  //   );
  // }

  getPendingTransactions() {
    return this.queue.map((entry) => {
      return entry.transaction;
    });
  }

  getPendingDataExtractions() {
    return this.dataExtractionQueue;
  }

  // syncEntry(entry) {
  //   let fileUploads$ = from([]);
  //   const reportId = entry.reportId;

  //   if (!entry.receiptsData) {
  //     if (entry.dataUrls && entry.dataUrls.length > 0) {
  //       fileUploads$ = concat<any[]>(entry.dataUrls.map(dataUrl => this.fileUpload(dataUrl.url, dataUrl.type, dataUrl.receiptCoordinates)));
  //     }
  //   }

  //   return this.transactionService.createTxnWithFiles(entry.transaction, fileUploads$).pipe(
  //     switchMap((resp: any) => {
  //       let comments = entry.comments;
  //       // adding created transaction id into entry object to get created transaction id when promise is resolved.
  //       entry.transaction.id = resp.id;
  //       let statusUpdates = [];
  //       if (comments && comments.length > 0) {
  //         statusUpdates = comments.map((comment) => this.statusService.post('transactions', resp.id, { comment }, true));
  //       }

  //       if (entry.receiptsData) {
  //         const linkReceiptPayload = {
  //           transaction_id: entry.transaction.id,
  //           linked_by: entry.receiptsData.linked_by
  //         };
  //         ReceiptsService.linkReceiptWithExpense(entry.receiptsData.receipt_id, linkReceiptPayload);
  //       };
  //       if (entry.dataUrls && entry.dataUrls.length > 0) {
  //         TransactionService.getETxn(resp.id).then(function (etxn) {
  //           entry.dataUrls.forEach(function (dataUrl) {
  //             if (dataUrl.callBackUrl) {
  //               $http.post(dataUrl.callBackUrl, {
  //                 'entered_data': {
  //                   'amount': etxn.tx.amount,
  //                   'currency': etxn.tx.currency,
  //                   'orig_currency': etxn.tx.orig_currency,
  //                   'orig_amount': etxn.tx.orig_amount,
  //                   'date': etxn.tx.txn_dt,
  //                   'vendor': etxn.tx.vendor,
  //                   'category': etxn.tx.fyle_category,
  //                   'external_id': etxn.tx.external_id,
  //                   'transaction_id': etxn.tx.id
  //                 }
  //               });
  //             }
  //           });
  //         });
  //       }

  //       if (reportId) {
  //         txnIds = [resp.id];
  //         ReportService.addTransactions(reportId, txnIds).then(function (result) {
  //           TrackingService.addToExistingReportAddEditExpense({ Asset: 'Mobile' });
  //           return result;
  //         });
  //       }

  //       removeEntry(entry);

  //       //This would be on matching an expense for the first time
  //       if (entry.transaction.matchCCCId) {
  //         TransactionService.matchCCCExpense(resp.id, entry.transaction.matchCCCId);
  //       }

  //       if (entry.applyMagic) {
  //         addDataExtractionEntry(resp, entry.dataUrls);
  //       }
  //     })
  //   )

  //   TransactionService.createTxnWithFiles(entry.transaction, fileObjPromiseArray).then(function (resp) {
  //     d.resolve(entry);
  //   }, function (err) {
  //     TrackingService.syncError({ Asset: 'Mobile', label: err });

  //     d.reject(err);
  //     console.log("unable to upload.. will try later");
  //   });

  //   return d.promise;
  // }

  // sync() {
  //   self = this;

  //   if (syncDeferred) {
  //     console.log('returning old promise');
  //     return syncDeferred.promise;
  //   }

  //   syncInProgress = true;
  //   syncDeferred = $q.defer();

  //   p = [];

  //   for (i = 0; i < queue.length; i++) {
  //     console.log("processing txn " + i);
  //     p.push(self.syncEntry(queue[i]));
  //   }

  //   $q.all(p).finally(function () {
  //     // if (p.length > 0) {
  //     //   console.log('clearing cache');
  //     //   TransactionService.deleteCache();
  //     //   console.log('clearing syncDeferred');
  //     // }
  //     processDataExtractionEntry();

  //     syncDeferred.resolve(true);
  //     syncDeferred = null;
  //     syncInProgress = false;
  //   });

  //   return syncDeferred.promise;
  // };

  // createTxnAndUploadBase64File(transaction, base64Content) {
  //   return TransactionService.upsert(transaction).then(function (res) {
  //     return FileService.base64Upload('expense.jpg', base64Content, res.id, null, null);
  //   });
  // };

  // isSyncInProgress() {
  //   return syncInProgress;
  // };

  // isDataExtractionPending(txnId) {
  //   txnIds = dataExtractionQueue.map(function (entry) {
  //     return entry.transaction.id;
  //   });

  //   return txnIds.indexOf(txnId) > -1;
  // };
}
