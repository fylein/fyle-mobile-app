import { Inject, Injectable } from '@angular/core';
import { Observable, Subject, from, of, range } from 'rxjs';
import { catchError, concatMap, map, mergeMap, reduce, switchMap, tap } from 'rxjs/operators';
import { CacheBuster, Cacheable } from 'ts-cacheable';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { SpenderPlatformV1ApiService } from '../../../spender-platform-v1-api.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { PlatformApiPayload } from 'src/app/core/models/platform/platform-api-payload.model';
import { ReportPlatformParams, CreateDraftParams } from 'src/app/core/models/platform/v1/reports-query-params.model';
import { UserEventService } from '../../../user-event.service';
import { PAGINATION_SIZE } from 'src/app/constants';

const reportsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class PlatformReportService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private userEventService: UserEventService,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService
  ) {
    reportsCacheBuster$.subscribe(() => {
      this.userEventService.clearTaskCache();
    });
  }

  @CacheBuster({
    cacheBusterNotifier: reportsCacheBuster$,
  })
  createDraft(data: CreateDraftParams): Observable<Report> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiPayload<Report>>('/reports', data)
      .pipe(map((res) => res.data));
  }

  @Cacheable({
    cacheBusterObserver: reportsCacheBuster$,
  })
  getAllReportsByParams(queryParams: ReportPlatformParams): Observable<Report[]> {
    return this.getReportsCount(queryParams).pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getReportsByParams(queryParams, this.paginationSize * page, this.paginationSize)),
      reduce((acc, curr) => acc.concat(curr.data), [] as Report[])
    );
  }

  getReportsCount(queryParams?: ReportPlatformParams): Observable<number> {
    return this.getReportsByParams(queryParams).pipe(map((res) => res.count));
  }

  getReportsByParams(
    queryParams: ReportPlatformParams = {},
    offset: number = 0,
    limit: number = 1
  ): Observable<PlatformApiResponse<Report>> {
    const config = {
      params: {
        ...queryParams,
        offset,
        limit,
      },
    };
    return this.spenderPlatformV1ApiService.get<PlatformApiResponse<Report>>('/reports', config);
  }
}
