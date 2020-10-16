import { Component, OnInit } from '@angular/core';
import { Observable, Subject, from, noop } from 'rxjs';
import { OfflineService } from 'src/app/core/services/offline.service';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { concatMap, switchMap, finalize, map, scan, shareReplay } from 'rxjs/operators';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';

@Component({
  selector: 'app-team-advance',
  templateUrl: './team-advance.page.html',
  styleUrls: ['./team-advance.page.scss'],
})
export class TeamAdvancePage implements OnInit {

  teamAdvancerequests$: Observable<any[]>;
  loadData$: Subject<number> = new Subject();
  count$: Observable<number>;
  currentPageNumber = 1;
  isInfiniteScrollRequired$: Observable<boolean>;

  constructor(
    private offlineService: OfflineService,
    private advanceRequestService: AdvanceRequestService,
    private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.teamAdvancerequests$ = this.loadData$.pipe(
      concatMap(pageNumber => {
        return from(this.loaderService.showLoader()).pipe(
          switchMap(() => {
            return this.advanceRequestService.getTeamadvanceRequests({
              offset: (pageNumber - 1) * 10,
              limit: 10,
              queryParams: {
                areq_state: ['eq.APPROVAL_PENDING'],
                areq_trip_request_id: ['is.null'],
                or: ['(areq_is_sent_back.is.null,areq_is_sent_back.is.false)']
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
      }, [] as ExtendedAdvanceRequest[]),
      shareReplay()
    );

    this.count$ = this.advanceRequestService.getTeamAdvanceRequestsCount(
      {
        areq_state: ['eq.APPROVAL_PENDING'],
        areq_trip_request_id: ['is.null'],
        or: ['(areq_is_sent_back.is.null,areq_is_sent_back.is.false)']
      }
    ).pipe(
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
    this.loadData$.next(this.currentPageNumber);
  }

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

}
