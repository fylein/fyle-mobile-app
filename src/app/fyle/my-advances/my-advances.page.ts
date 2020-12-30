import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {combineLatest, range, zip} from 'rxjs';
import { forkJoin, from, noop, Observable, Subject } from 'rxjs';
import {concatMap, finalize, map, reduce, startWith, switchMap, tap} from 'rxjs/operators';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { AdvanceService } from 'src/app/core/services/advance.service';
import { LoaderService } from 'src/app/core/services/loader.service';

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

  constructor(
    private advanceRequestService: AdvanceRequestService,
    private loaderService: LoaderService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private advanceService: AdvanceService
  ) { }

  ionViewWillEnter() {
    this.navigateBack = !!this.activatedRoute.snapshot.params.navigateBack;

    this.myAdvancerequests$ = this.advanceRequestService.getMyAdvanceRequestsCount({ areq_trip_request_id: 'is.null', areq_advance_id: 'is.null' }).pipe(
      switchMap(count => {
        return range(0, count / 10);
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
      tap(beforeRange => console.log({ beforeRange })),
      switchMap(count => {
        return range(0, count / 10);
      }),
      tap(afterRange => console.log({ afterRange })),
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
        return from(this.loaderService.showLoader('Retriving Advance')).pipe(
          switchMap(() => {
            return combineLatest([
              this.myAdvancerequests$,
              this.myAdvances$
            ]).pipe(
              map(res => {
                const [myAdvancerequestsRes,  myAdvancesRes] = res;
                let myAdvancerequests = myAdvancerequestsRes || [];
                let myAdvances = myAdvancesRes || [];
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
          }),
          finalize(() => {
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
