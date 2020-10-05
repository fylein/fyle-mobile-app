import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { switchMap, tap } from 'rxjs/operators';
import { from } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService
  ) { }

  getUserReportParams(state: string) {
  	const stateMap = {
      draft: {
        state: ['DRAFT', 'DRAFT_INQUIRY']
      },
      pending: {
        state: ['APPROVER_PENDING']
      },
      inquiry: {
        state: ['APPROVER_INQUIRY']
      },
      approved: {
        state: ['APPROVED']
      },
      payment_queue: {
        state: ['PAYMENT_PENDING']
      },
      paid: {
        state: ['PAID']
      },
      edit: {
        state: ['DRAFT', 'APPROVER_PENDING']
      },
      all: {
        state: ['DRAFT', 'DRAFT_INQUIRY', 'COMPLETE', 'APPROVED', 'APPROVER_PENDING', 'APPROVER_INQUIRY', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID', 'REJECTED']
      }
    };

    return stateMap[state];
  }

  getPaginatedERptcStats(params) {
    return this.apiService.get('/erpts/stats', {params});
  };

  @Cacheable()
  getPaginatedERptcCount (params) {
    return this.networkService.isOnline().pipe(
      switchMap(
        isOnline => {
          if (isOnline) {
            return this.apiService.get('/erpts/count', {params}).pipe(
              tap((res) => {
                this.storageService.set('erpts-count' + JSON.stringify(params), res);
              })
            );
          } else {
            return from(this.storageService.get('erpts-count' + JSON.stringify(params)));
          }
        }
      )
    );
  };

}
