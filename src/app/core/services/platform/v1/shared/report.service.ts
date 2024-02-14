import { Inject, Injectable } from '@angular/core';
import { Observable, Subject, from, of, range } from 'rxjs';
import { catchError, concatMap, map, mergeMap, reduce, switchMap, tap } from 'rxjs/operators';
import { CacheBuster, Cacheable } from 'ts-cacheable';
import { PlatformReport } from 'src/app/core/models/platform/v1/platform-report.model';
import { SpenderPlatformV1ApiService } from '../../../spender-platform-v1-api.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { ReportPlatformParams } from 'src/app/core/models/platform/v1/reports-query-params.model';
import { UserEventService } from '../../../user-event.service';

const reportsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class PlatformReportService {
  constructor(
    private userEventService: UserEventService,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService
  ) {
    reportsCacheBuster$.subscribe(() => {
      this.userEventService.clearTaskCache();
    });
  }

  @Cacheable()
  getAllReportsByParams(queryParams: ReportPlatformParams = {}): Observable<PlatformReport[]> {
    return of(queryParams).pipe(
      // first we will get count of Reports and on basis of that make parallel calls
      mergeMap((queryParams) => this.getReportsCount(queryParams)),
      mergeMap((count) => this.getReportsInParallel(count, queryParams))
    );
  }

  getReportsByParams(
    queryParams: ReportPlatformParams = {},
    offset: number = 0,
    limit: number = 1
  ): Observable<PlatformApiResponse<PlatformReport>> {
    const config = {
      params: {
        ...queryParams,
        offset,
        limit,
      },
    };
    return this.spenderPlatformV1ApiService.get<PlatformApiResponse<PlatformReport>>('/reports', config);
  }

  getReportsCount(queryParams?: ReportPlatformParams): Observable<number> {
    return this.getReportsByParams(queryParams, 0, 1).pipe(map((res) => res.count));
  }

  getReportsInParallel(
    count: number,
    queryParams: ReportPlatformParams,
    offset: number = 0,
    reports: PlatformReport[] = []
  ): Observable<PlatformReport[]> {
    const limit = 200;
    const maxParallelCalls = 3;
    if (count > limit) {
      // Decides how many api calls should be sent at once in parallel, upto a max number
      const numberOfCallsRequired = Math.ceil(count / limit);
      const numberOfParallelCalls = Math.min(numberOfCallsRequired, maxParallelCalls);

      return from(Array(numberOfParallelCalls).keys()).pipe(
        mergeMap((i) => this.getReportsByParams(queryParams, offset + 200 * i, limit)),
        map((response) => response.data),
        // Since we receive [Response1, Response2, Response3], we will reduce them into array of reports.
        reduce((accumulatedReports, currentReports) => [...accumulatedReports, ...currentReports]),
        mergeMap((iterationReports) => {
          offset += 600;
          reports = [...reports, ...iterationReports];
          const remainingCount = count - iterationReports.length;
          if (remainingCount > 0) {
            // If we still have more data to fetch, call the same function again but with remaining count
            return this.getReportsInParallel(remainingCount, queryParams, offset, reports);
          } else {
            return of(reports);
          }
        })
      );
    } else {
      // This case will execute when the reports can be fetched in one api call only
      return this.getReportsByParams(queryParams, offset, limit).pipe(
        map((response) => [...reports, ...response.data])
      );
    }
  }
}
