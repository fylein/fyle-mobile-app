import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { switchMap, tap } from 'rxjs/operators';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdvanceRequestService {

  constructor(
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService
  ) { }

  getUserAdvanceRequestParams(state: string) {
    var stateMap = {
      draft: {
        state: ['DRAFT'],
        is_sent_back: false
      },
      pending: {
        state: ['APPROVAL_PENDING']
      },
      approved: {
        state: ['APPROVED']
      },
      inquiry: {
        state: ['DRAFT'],
        is_sent_back: true
      },
      all: {
        state: ['APPROVAL_PENDING','DRAFT','APPROVED','REJECTED']
      }
    };

    return stateMap[state];
  }

  getPaginatedEAdvanceRequestsStats(params) {
    return this.apiService.get('/eadvance_requests/stats', {params});
  }

  getPaginatedMyEAdvanceRequestsCount(params) {
    return this.networkService.isOnline().pipe(
      switchMap(
        isOnline => {
          if (isOnline) {
            return this.apiService.get('/eadvance_requests/count', {params}).pipe(
              tap((res) => {
                this.storageService.set('eadvanceRequestsCount' + JSON.stringify(params), res);
              })
            );
          } else {
            return from(this.storageService.get('eadvanceRequestsCount' + JSON.stringify(params)));
          }
        }
      )
    );
  }


}
