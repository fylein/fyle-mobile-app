import { Component, OnInit, EventEmitter } from '@angular/core';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { ExtendedTripRequest } from 'src/app/core/models/extended_trip_request.model';
import { Observable, Subject, noop, from, concat } from 'rxjs';
import { map, shareReplay, concatMap, switchMap, scan, finalize } from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.page.html',
  styleUrls: ['./my-trips.page.scss'],
})
export class MyTripsPage implements OnInit {
  isConnected$: Observable<boolean>;

  myTripRequests$: Observable<ExtendedTripRequest[]>;

  count$: Observable<number>;

  isInfiniteScrollRequired$: Observable<boolean>;

  loadData$: Subject<number> = new Subject();

  currentPageNumber = 1;

  navigateBack = false;

  deprecationMsg$: Observable<string>;

  constructor(
    private tripRequestsService: TripRequestsService,
    private loaderService: LoaderService,
    private networkService: NetworkService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ionViewWillEnter() {
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;

    this.deprecationMsg$ = this.tripRequestsService.getTripDeprecationMsg('individual');

    this.currentPageNumber = 1;

    this.myTripRequests$ = this.loadData$.pipe(
      concatMap((pageNumber) =>
        from(this.loaderService.showLoader()).pipe(
          switchMap(() =>
            this.tripRequestsService.getMyTrips({
              offset: (pageNumber - 1) * 10,
              limit: 10,
              queryParams: { order: 'trp_created_at.desc,trp_id.desc' },
            })
          ),
          finalize(() => from(this.loaderService.hideLoader()))
        )
      ),
      map((res) => res.data),
      scan((acc, curr) => {
        if (this.currentPageNumber === 1) {
          return curr;
        }
        return acc.concat(curr);
      }, [] as ExtendedTripRequest[]),
      shareReplay(1)
    );

    this.count$ = this.tripRequestsService.getMyTripsCount().pipe(shareReplay(1));

    this.isInfiniteScrollRequired$ = this.myTripRequests$.pipe(
      concatMap((myTrips) => this.count$.pipe(map((count) => count > myTrips.length)))
    );

    this.loadData$.subscribe(noop);
    this.myTripRequests$.subscribe(noop);
    this.count$.subscribe(noop);
    this.isInfiniteScrollRequired$.subscribe(noop);
    this.loadData$.next(this.currentPageNumber);

    this.setupNetworkWatcher();
  }

  ngOnInit() {}

  loadData(event) {
    this.currentPageNumber = this.currentPageNumber + 1;
    this.loadData$.next(this.currentPageNumber);
    event.target.complete();
  }

  doRefresh(event) {
    this.currentPageNumber = 1;
    this.loadData$.next(this.currentPageNumber);
    event.target.complete();
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    });
  }

  onTripClick(clickedTrip: ExtendedTripRequest) {
    this.router.navigate(['/', 'enterprise', 'my_view_trips', { id: clickedTrip.trp_id }]);
  }
}
