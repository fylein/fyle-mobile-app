import { Component, OnInit, EventEmitter } from '@angular/core';
import { Subject, Observable, from, noop, concat } from 'rxjs';
import { ExtendedTripRequest } from 'src/app/core/models/extended_trip_request.model';
import { concatMap, switchMap, finalize, map, scan, shareReplay } from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-team-trips',
  templateUrl: './team-trips.page.html',
  styleUrls: ['./team-trips.page.scss'],
})
export class TeamTripsPage implements OnInit {

  pageTitle = 'Team Trips';
  isConnected$: Observable<boolean>;
  teamTripRequests$: Observable<ExtendedTripRequest[]>;
  count$: Observable<number>;
  isInfiniteScrollRequired$: Observable<boolean>;
  loadData$: Subject<number> = new Subject();
  currentPageNumber = 1;

  constructor(
    private loaderService: LoaderService,
    private tripRequestsService: TripRequestsService,
    private networkService: NetworkService,
    private router: Router
  ) { }

  ngOnInit() {
    this.teamTripRequests$ = this.loadData$.pipe(
      concatMap(pageNumber => {
        return from(this.loaderService.showLoader()).pipe(
          switchMap(() => {
            return this.tripRequestsService.getTeamTrips({
              offset: (pageNumber - 1) * 10,
              limit: 10,
              queryParams: {
                trp_approval_state: ['in.(APPROVAL_PENDING)'],
                trp_state: 'eq.APPROVAL_PENDING'
              }
            });
          }),
          finalize(() => {
            return from(this.loaderService.hideLoader());
          })
        );
      }),
      map(res => res.data),
      scan((acc, curr) => {
        if (this.currentPageNumber === 1) {
          return curr;
        }
        return acc.concat(curr);
      }, [] as ExtendedTripRequest[]),
      shareReplay()
    );

    this.count$ = this.tripRequestsService.getTeamTripsCount().pipe(
      shareReplay()
    );

    this.isInfiniteScrollRequired$ = this.teamTripRequests$.pipe(
      concatMap(teamTrips => {
        return this.count$.pipe(map(count => {
          return count > teamTrips.length;
        }));
      })
    );

    this.loadData$.subscribe(noop);
    this.teamTripRequests$.subscribe(noop);
    this.count$.subscribe(noop);
    this.isInfiniteScrollRequired$.subscribe(noop);
    this.loadData$.next(this.currentPageNumber);

    this.setupNetworkWatcher();
  }

  doRefresh(event) {
    this.currentPageNumber = 1;
    this.loadData$.next(this.currentPageNumber);
    event.target.complete();
  }

  loadData(event) {
    this.currentPageNumber = this.currentPageNumber + 1;
    this.loadData$.next(this.currentPageNumber);
    event.target.complete();
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    });
  }

  onTripClick(clickedTrip: ExtendedTripRequest) {
    this.router.navigate(['/', 'enterprise', 'view_team_trips', { id: clickedTrip.trp_id }]);
  }

}
