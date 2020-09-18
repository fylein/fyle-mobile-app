import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { switchMap, tap } from 'rxjs/operators';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TripRequestService {

  constructor(
    private networkService: NetworkService,
    private storageService: StorageService,
    private apiService: ApiService
  ) { }

  getUserTripRequestStateParams(state: string) {
    let stateMap = {
      draft: {
        state: ['DRAFT'],
        is_sent_back: false
      },
      inquiry: {
        state: ['DRAFT'],
        is_sent_back: true
      },
      submitted: {
        state: ['APPROVAL_PENDING']
      },
      approved: {
        state: ['APPROVED']
      },
      booked: {
        state: ['APPROVED'],
        is_booked: true
      },
      to_close: {
        state: ['APPROVED'],
        is_to_close: true
      },
      all: {
        state: ['DRAFT', 'APPROVAL_PENDING', 'APPROVED', 'REJECTED', 'CLOSED']
      }
    };

    return stateMap[state];
  };

  getPaginatedMyETripRequestsCount(params) {
    return this.networkService.isOnline().pipe(
      switchMap(
        isOnline => {
          if (isOnline) {
            return this.apiService.get('/etrip_requests/count', {params}).pipe(
              tap((res) => {
                this.storageService.set('etripRequestsCount' + JSON.stringify(params), res);
              })
            );
          } else {
            return from(this.storageService.get('etripRequestsCount' + JSON.stringify(params)));
          }
        }
      )
    );
  }

}
