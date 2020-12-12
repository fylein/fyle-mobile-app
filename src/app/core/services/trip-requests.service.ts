import { Injectable } from '@angular/core';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';
import { from, Observable } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { ExtendedTripRequest } from '../models/extended_trip_request.model';
import { ApiService } from './api.service';
import { DataTransformService } from './data-transform.service';
import { TripDatesService } from './trip-dates.service';
import { Approval } from '../models/approval.model';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TripRequestsService {

  constructor(
    private apiv2Service: ApiV2Service,
    private apiService: ApiService,
    private authService: AuthService,
    private dataTransformService: DataTransformService,
    private tripDatesService: TripDatesService,
    private networkService: NetworkService,
    private storageService: StorageService
  ) { }

  getMyTrips(config: Partial<{ offset: number, limit: number, queryParams: any }> = {
    offset: 0,
    limit: 10,
    queryParams: {}
  }) {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.apiv2Service.get('/trip_requests', {
          params: {
            offset: config.offset,
            limit: config.limit,
            trp_org_user_id: 'eq.' + eou.ou.id,
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

  getTrip(id: string): Observable<ExtendedTripRequest> {
    return this.apiv2Service.get('/trip_requests', {
      params: {
        trp_id: `eq.${id}`
      }
    }).pipe(
      map(
        res => {
          const modifiedTrip = this.fixDates(res.data[0]) as ExtendedTripRequest;
          // try catch is failsafe against bad data
          try {
            modifiedTrip.trp_custom_field_values = JSON.parse(modifiedTrip.trp_custom_field_values);
          } catch (error) {
          }
          return modifiedTrip;
        }
      )
    );
  }

  get(tripRequestId) {
    return this.apiService.get('/trip_requests/' + tripRequestId)
  }

  getActions(tripRequestId: string) {
    return this.apiService.get('/trip_requests/' + tripRequestId + '/actions');
  }

  getAdvanceRequests(tripRequestId: string) {
    return this.apiService.get('/trip_requests/' + tripRequestId + '/advance_requests');
  }

  getHotelRequests(tripRequestId: string) {
    return this.apiService.get('/trip_requests/' + tripRequestId + '/hotel_requests').pipe(
      map((reqs) => {
        return reqs.map(req => {
          const hotelRequest = this.dataTransformService.unflatten(req);
          this.tripDatesService.fixDates(hotelRequest.hr);
          this.tripDatesService.fixDates(hotelRequest.hb);
          this.tripDatesService.fixDates(hotelRequest.hc);
          return hotelRequest;
        });
      })
    );
  }

  delete(tripRequestId: string) {
    return this.apiService.delete('/trip_requests/' + tripRequestId);
  }

  getTransportationRequests(tripRequestId: string) {
    return this.apiService.get('/trip_requests/' + tripRequestId + '/transportation_requests').pipe(
      map((reqs) => reqs.map(req => {
        const transportationRequest = this.dataTransformService.unflatten(req);
        this.tripDatesService.fixDates(transportationRequest.tr);
        this.tripDatesService.fixDates(transportationRequest.tb);
        this.tripDatesService.fixDates(transportationRequest.tc);
        return transportationRequest;
      })
      )
    );
  }

  getTeamTripsCount(queryParams = {})  {
    return this.getTeamTrips({
      offset: 0,
      limit: 1,
      queryParams
    }).pipe(
      map(trip => trip.count)
    );
  }

  getTeamTrips(config: Partial<{ offset: number, limit: number, queryParams: any }> = {
    offset: 0,
    limit: 10,
    queryParams: {}
  }) {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.apiv2Service.get('/trip_requests', {
          params: {
            offset: config.offset,
            limit: config.limit,
            order: 'trp_created_at.desc',
            approvers: 'cs.{' + eou.ou.id + '}',
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

  getApproversByTripRequestId(tripRequestId: string) {
    return this.apiService.get('/trip_requests/' + tripRequestId + '/approvals').pipe(
      map(res => res as Approval[])
    );
  }

  fixDates(datum: ExtendedTripRequest) {
    datum.trp_created_at = new Date(datum.trp_created_at);
    datum.trp_updated_at = new Date(datum.trp_updated_at);

    datum.trp_trip_cities = datum.trp_trip_cities.map(trpCity => {
      trpCity.onward_date = new Date(trpCity.onward_date);
      trpCity.return_date = trpCity.return_date ? new Date(trpCity.return_date) : null;
      return trpCity;
    });

    datum.trp_start_date = new Date(datum.trp_start_date);
    datum.trp_end_date = new Date(datum.trp_end_date);

    return datum;
  }


  getMyTripsCount(queryParams = {}) {
    return this.getMyTrips({
      offset: 0,
      limit: 1,
      queryParams
    }).pipe(
      map(trip => trip.count)
    );
  }

  getInternalStateAndDisplayName(tripRequest: ExtendedTripRequest): { state: string, name: string } {
    if (tripRequest.trp_state === 'DRAFT') {
      if (!tripRequest.trp_is_pulled_back && !tripRequest.trp_is_sent_back) {
        return {
          state: 'draft',
          name: 'Draft'
        };
      } else if (tripRequest.trp_is_pulled_back) {
        return {
          state: 'pulledBack',
          name: 'Pulled Back'
        };
      } else if (tripRequest.trp_is_sent_back) {
        return {
          state: 'inquiry',
          name: 'Inquiry'
        };
      }
    } else if (tripRequest.trp_state === 'APPROVAL_PENDING') {
      return {
        state: 'pendingApproval',
        name: 'Pending Approval'
      };
    } else if (tripRequest.trp_state === 'APPROVED') {
      if (!tripRequest.trp_is_to_close) {
        if (tripRequest.trp_is_booked === null && tripRequest.trp_is_requested_cancellation === null) {
          return {
            state: 'approved',
            name: 'Approved'
          };
        } else if (tripRequest.trp_is_booked === false && tripRequest.trp_is_requested_cancellation === null) {
          return {
            state: 'pendingBooking',
            name: 'Pending Booking'
          };
        } else if (tripRequest.trp_is_booked === true && tripRequest.trp_is_requested_cancellation === null) {
          return {
            state: 'booked',
            name: 'Booked'
          };
        } else if (tripRequest.trp_is_booked === true && tripRequest.trp_is_requested_cancellation === true) {
          return {
            state: 'pendingCancellation',
            name: 'Pending Cancellation'
          };
        } else if (tripRequest.trp_is_requested_cancellation === false) {
          return {
            state: 'cancelled',
            name: 'Cancelled'
          };
        }
      } else {
        return {
          state: 'pendingClosure',
          name: 'Pending Closure'
        };
      }
    } else if (tripRequest.trp_state === 'CLOSED') {
      return {
        state: 'closed',
        name: 'Closed'
      };
    } else if (tripRequest.trp_state === 'REJECTED') {
      return {
        state: 'rejected',
        name: 'Rejected'
      };
    }
  }

  getUserTripRequestStateParams(state: string) {
    const stateMap = {
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
  }

  getPaginatedMyETripRequestsCount(params) {
    return this.networkService.isOnline().pipe(
      switchMap(
        isOnline => {
          if (isOnline) {
            return this.apiService.get('/etrip_requests/count', { params }).pipe(
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

  pullBackTrip(tripRequestId: string, addStatusPayload) {
    return this.apiService.post('/trip_requests/' + tripRequestId + '/pull_back', addStatusPayload);
  }

  closeTrip(tripRequestId: string) {
    return this.apiService.post('/trip_requests/' + tripRequestId + '/close');
  }

  addApproverETripRequests(tripRequestId, approverEmail, comment) {
    const data = {
      approver_email: approverEmail,
      comment: comment
    };

    return this.apiService.post('/trip_requests/' + tripRequestId + '/approver/add', data);
  }

  findMyUnreportedRequests() {
    const data = {
      params: {
        only_unreported: true
      }
    };

    return this.apiService.get('/trip_requests', data);
  }

  action (action, tripRequestId) {
    return this.apiService.post('/trip_requests/' + tripRequestId + '/' + action)
      // self.deleteCache();
      // return result;
  }

  approve(tripRequestId) {
    return this.action('approve', tripRequestId);
  }

  inquire(tripRequestId, addStatusPayload) {
    return this.apiService.post('/trip_requests/' + tripRequestId + '/inquire', addStatusPayload);
      // self.deleteCache();
      // return req;
  }

  reject = function (tripRequestId, addStatusPayload) {
    return this.apiService.post('/trip_requests/' + tripRequestId + '/reject', addStatusPayload);
      // self.deleteCache();
      // return req;
  }
}
