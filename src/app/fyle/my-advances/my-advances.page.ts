import {Component, EventEmitter, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {concat, range} from 'rxjs';
import { forkJoin, from, noop, Observable, Subject } from 'rxjs';
import {concatMap, finalize, map, reduce, shareReplay, startWith, switchMap, takeUntil} from 'rxjs/operators';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { AdvanceService } from 'src/app/core/services/advance.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import {NetworkService} from '../../core/services/network.service';

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
    private networkService: NetworkService
  ) { }

  ionViewWillLeave() {
    this.onPageExit.next();
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(
      takeUntil(this.onPageExit),
      shareReplay()
    );

    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    });
  }

  ionViewWillEnter() {
    this.setupNetworkWatcher();
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;
    this.myAdvancerequests$ = this.advanceRequestService.getMyAdvanceRequestsCount({ areq_trip_request_id: 'is.null', areq_advance_id: 'is.null' }).pipe(
      concatMap(count => {
        count = count > 10 ? count / 10 : 1;
        return range(0, count);
      }),
      concatMap(count => {
        return this.advanceRequestService.getMyadvanceRequests({
          offset: 10 * count,
          limit: 10,
          queryParams: { areq_trip_request_id: 'is.null', areq_advance_id: 'is.null', order: 'areq_created_at.desc,areq_id.desc' }
        });
      }),
      map(res => res.data),
      reduce((acc, curr) => {
        return acc.concat(curr);
      }),
      startWith([])
    );

    this.myAdvances$ = this.advanceService.getMyAdvancesCount().pipe(
      concatMap(count => {
        count = count > 10 ? count / 10 : 1;
        return range(0, count);
      }),
      concatMap(count => {
        return this.advanceService.getMyadvances({
          offset: 10 * count,
          limit: 10,
          queryParams: {order: 'adv_created_at.desc,adv_id.desc' }
        });
      }),
      map(res => res.data),
      reduce((acc, curr) => {
        return acc.concat(curr);
      }),
      startWith([])
    );

    this.advances$ = this.refreshAdvances$.pipe(
      startWith(0),
      switchMap(() => {
        return from(this.loaderService.showLoader('Retrieving advance...')).pipe(
          switchMap(() => {
            return forkJoin({
              myAdvancerequests$: this.myAdvancerequests$,
              myAdvances$: this.myAdvances$
            }).pipe(
              map(res => {
                let myAdvancerequests = res.myAdvancerequests$ || [];
                let myAdvances = res.myAdvances$ || [];
                myAdvancerequests = myAdvancerequests.map(data => {
                  return {
                    ...data,
                    type: 'request',
                    currency: data.areq_currency,
                    amount: data.areq_amount,
                    created_at: data.areq_created_at,
                    purpose: data.areq_purpose,
                    state: data.areq_state
                  };
                });

                myAdvances = myAdvances.map(data => {
                  return {
                    ...data,
                    type: 'advance',
                    amount: data.adv_amount,
                    orig_amount: data.adv_orig_amount,
                    created_at: data.adv_created_at,
                    currency: data.adv_currency,
                    orig_currency: data.adv_orig_currency,
                    purpose: data.adv_purpose,
                  };
                });
                return myAdvances.concat(myAdvancerequests);
              }),
              map(res => {
                return res.sort((a, b) => (a.created_at < b.created_at) ? 1 : -1);
              })
            );
          }), finalize(() => {
            return from(this.loaderService.hideLoader());
          })
        );
      })

    );
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
    let id = null;
    let route = null;
    if (clickedAdvance.advanceRequest.type.toLowerCase() === 'advance') {
      id = clickedAdvance.advanceRequest.adv_id;
      route = 'my_view_advance';
    } else {
      id = clickedAdvance.advanceRequest.areq_id;
      route = 'my_view_advance_request';
    }

    if ((['draft', 'pulledBack', 'inquiry']).indexOf(clickedAdvance.internalState.state) > -1) {
      route = 'my_view_advance_request';
    }

    this.router.navigate(['/', 'enterprise', route, { id }]);
  }

  ngOnInit() { }

}
