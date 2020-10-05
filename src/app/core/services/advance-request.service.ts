import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { from } from 'rxjs';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';
import { ExtendedTripRequest } from '../models/extended_trip_request.model';

@Injectable({
  providedIn: 'root'
})
export class AdvanceRequestService {

  constructor(
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService,
    private apiv2Service: ApiV2Service,
    private authService: AuthService
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

  getPaginatedMyEAdvanceRequests(params: {offset: number, limit: number, params?: any}) {
    debugger;
    return this.apiv2Service.get('/advances', {params})
    // .pipe(
    //   map(res => {
    //     debugger;
    //   })
    // )

  }

  getMyadvanceRequests(config: Partial<{ offset: number, limit: number, queryParams: any }> = {
    offset: 0,
    limit: 10,
    queryParams: {}
  }) {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.apiv2Service.get('/advance_requests', {
          params: {
            offset: config.offset,
            limit: config.limit,
            areq_org_user_id: 'eq.' + eou.ou.id,
            ...config.queryParams
          }
        });
      }),
      map(res => res as {
        count: number,
        data: ExtendedTripRequest[],
        limit: number,
        offset: number,
        url: string
      }),
      map(res => ({
        ...res,
        data: res.data.map(this.fixDates)
      }))
    );
  }

  getMyAdvanceRequestsCount(queryParams = {}) {
    return this.getMyadvanceRequests({
      offset: 0,
      limit: 1,
      queryParams
    }).pipe(
      map(trip => trip.count)
    );
  }

  fixDates(data: ExtendedTripRequest) {
    
    return data;
  }


}
