import { Component, EventEmitter, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { concat, range, zip, combineLatest, iif, of } from 'rxjs';
import { forkJoin, from, noop, Observable, Subject } from 'rxjs';
import { concatMap, finalize, map, reduce, shareReplay, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { AdvanceService } from 'src/app/core/services/advance.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { NetworkService } from '../../core/services/network.service';

@Component({
  selector: 'app-my-advances',
  templateUrl: './my-advances.page.html',
  styleUrls: ['./my-advances.page.scss'],
})
export class MyAdvancesPage implements OnInit {
  myAdvancerequests$: Observable<any[]>;

  myAdvances$: Observable<any>;

  loadData$: Subject<number> = new Subject();

  navigateBack = false;

  refreshAdvances$: Subject<void> = new Subject();

  advances$: Observable<any>;

  isConnected$: Observable<boolean>;

  onPageExit = new Subject();

  constructor(
    private advanceRequestService: AdvanceRequestService,
    private loaderService: LoaderService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private advanceService: AdvanceService,
    private networkService: NetworkService,
    private offlineService: OfflineService
  ) { }

  ionViewWillLeave() {
    this.onPageExit.next();
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit),
      shareReplay(1)
    );

    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_dashboard']);
      }
    });
  }

  ionViewWillEnter() {
    this.setupNetworkWatcher();
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;

    this.myAdvancerequests$ = this.advanceRequestService.getMyAdvanceRequestsCount({
      areq_trip_request_id: 'is.null',
      areq_advance_id: 'is.null'
    })
      .pipe(
        concatMap(count => {
          count = count > 10 ? count / 10 : 1;
          return range(0, count);
        }),
        concatMap(count => this.advanceRequestService.getMyadvanceRequests({
          offset: 10 * count,
          limit: 10,
          queryParams: { areq_trip_request_id: 'is.null', areq_advance_id: 'is.null', order: 'areq_created_at.desc,areq_id.desc' }
        })),
        map(res => res.data),
        reduce((acc, curr) => acc.concat(curr)),
        startWith([])
      );

    this.myAdvances$ = this.advanceService.getMyAdvancesCount().pipe(
      concatMap(count => {
        count = count > 10 ? count / 10 : 1;
        return range(0, count);
      }),
      concatMap(count => this.advanceService.getMyadvances({
        offset: 10 * count,
        limit: 10,
        queryParams: { order: 'adv_created_at.desc,adv_id.desc' }
      })),
      map(res => res.data),
      reduce((acc, curr) => acc.concat(curr)),
      startWith([])
    );

    const sortResults = map((res: any[]) => res.sort((a, b) => (a.created_at < b.created_at) ? 1 : -1));
    this.advances$ = this.refreshAdvances$.pipe(
      startWith(0),
      switchMap(() => from(this.loaderService.showLoader('Retrieving advance...')).pipe(
        concatMap(() => this.offlineService.getOrgSettings()),
        switchMap((orgSettings) => combineLatest([
          iif(() => orgSettings.advance_requests.enabled, this.myAdvancerequests$, of(null)),
          iif(() => orgSettings.advances.enabled, this.myAdvances$, of(null)),
        ]).pipe(
          map(res => {
            const [myAdvancerequestsRes, myAdvancesRes] = res;
            let myAdvancerequests = myAdvancerequestsRes || [];
            let myAdvances = myAdvancesRes || [];
            myAdvancerequests = this.updateMyAdvanceRequests(myAdvancerequests);

            myAdvances = this.updateMyAdvances(myAdvances);
            return myAdvances.concat(myAdvancerequests);
          }),
          sortResults
        )),
        finalize(() => from(this.loaderService.hideLoader()))
      ))

    );
  }

  updateMyAdvances(myAdvances: any) {
    myAdvances = myAdvances.map(data => ({
      ...data,
      type: 'advance',
      amount: data.adv_amount,
      orig_amount: data.adv_orig_amount,
      created_at: data.adv_created_at,
      currency: data.adv_currency,
      orig_currency: data.adv_orig_currency,
      purpose: data.adv_purpose,
    }));
    return myAdvances;
  }

  updateMyAdvanceRequests(myAdvancerequests: any) {
    myAdvancerequests = myAdvancerequests.map(data => ({
      ...data,
      type: 'request',
      currency: data.areq_currency,
      amount: data.areq_amount,
      created_at: data.areq_created_at,
      purpose: data.areq_purpose,
      state: data.areq_state
    }));
    return myAdvancerequests;
  }

  doRefresh(event) {
    forkJoin({
      destroyAdvanceRequestsCacheBuster: this.advanceRequestService.destroyAdvanceRequestsCacheBuster(),
      destroyAdvancesCacheBuster: this.advanceService.destroyAdvancesCacheBuster()
    }).pipe(
      map(() => {
        this.refreshAdvances$.next();
        event.target.complete();
      })
    ).subscribe(noop);
  }

  onAdvanceClick(clickedAdvance: any) {
    const id = clickedAdvance.advanceRequest.adv_id || clickedAdvance.advanceRequest.areq_id;
    let route = 'my_view_advance_request';
    if (clickedAdvance.advanceRequest.type === 'request' && clickedAdvance.internalState.state.toLowerCase() === 'inquiry') {
      route = 'add_edit_advance_request';
    }

    if (clickedAdvance.advanceRequest.type === 'advance') {
      route = 'my_view_advance';
    }

    this.router.navigate(['/', 'enterprise', route, { id }]);
  }

  ngOnInit() { }

}
