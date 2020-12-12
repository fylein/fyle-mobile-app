import { Component, OnInit } from '@angular/core';
import { Observable, Subject, from, noop } from 'rxjs';
import { OfflineService } from 'src/app/core/services/offline.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { concatMap, switchMap, finalize, map, scan, shareReplay, tap } from 'rxjs/operators';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-team-advance',
  templateUrl: './team-advance.page.html',
  styleUrls: ['./team-advance.page.scss'],
})
export class TeamAdvancePage implements OnInit {

  teamAdvancerequests$: Observable<any[]>;
  loadData$: Subject<{ pageNumber: number, state: string }> = new Subject();
  count$: Observable<number>;
  currentPageNumber = 1;
  isInfiniteScrollRequired$: Observable<boolean>;
  state = 'PENDING';

  constructor(
    private offlineService: OfflineService,
    private advanceRequestService: AdvanceRequestService,
    private loaderService: LoaderService,
    private router: Router
  ) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.currentPageNumber = 1;
    this.teamAdvancerequests$ = this.loadData$.pipe(
      concatMap(({ pageNumber, state }) => {
        const extraParams = state === 'PENDING'? { 
          areq_state: ['eq.APPROVAL_PENDING'],
          areq_trip_request_id: ['is.null'],
          or: ['(areq_is_sent_back.is.null,areq_is_sent_back.is.false)']

        }: { };

        return from(this.loaderService.showLoader()).pipe(
          switchMap(() => {
            return this.advanceRequestService.getTeamadvanceRequests({
              offset: (pageNumber - 1) * 10,
              limit: 10,
              queryParams: {
                ...extraParams
              },
              filter: state
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
      }, [] as ExtendedAdvanceRequest[]),
      shareReplay()
    );

    this.count$ = this.loadData$.pipe(
      switchMap(({ state })=> {
        const extraParams = state === 'PENDING'? { 
          areq_state: ['eq.APPROVAL_PENDING'],
          areq_trip_request_id: ['is.null'],
          or: ['(areq_is_sent_back.is.null,areq_is_sent_back.is.false)']

        }: { };

        return this.advanceRequestService.getTeamAdvanceRequestsCount(
          {
            ...extraParams
          },
          state
        );
      }),
      shareReplay()
    );

    this.isInfiniteScrollRequired$ = this.teamAdvancerequests$.pipe(
      concatMap(teamAdvancerequests => {
        return this.count$.pipe(map(count => {
          return count > teamAdvancerequests.length;
        }));
      })
    );

    this.loadData$.subscribe(noop);
    this.teamAdvancerequests$.subscribe(noop);
    this.count$.subscribe(noop);
    this.isInfiniteScrollRequired$.subscribe(noop);
    this.loadData$.next({ pageNumber: this.currentPageNumber, state: this.state });
  }

  loadData(event) {
    this.currentPageNumber = this.currentPageNumber + 1;
    this.loadData$.next({ pageNumber: this.currentPageNumber, state: this.state });
    event.target.complete();
  }

  doRefresh(event) {
    this.currentPageNumber = 1;
    this.loadData$.next({ pageNumber: this.currentPageNumber, state: this.state });
    event.target.complete();
  }

  onAdvanceClick(areq: ExtendedAdvanceRequest) {
    this.router.navigate(['/', 'enterprise', 'view_team_advance', { id: areq.areq_id }]);
  }

  changeState(state) {
    this.currentPageNumber = 1;
    this.state = state;
    this.loadData$.next({ pageNumber: this.currentPageNumber, state: this.state });
  }

}
