import { Inject, Injectable } from '@angular/core';
import { Observable, Subject, from, of, range } from 'rxjs';
import { catchError, concatMap, map, mergeMap, reduce, switchMap, tap } from 'rxjs/operators';
import { PlatformReport } from 'src/app/core/models/platform/platform-report.model';
import { SpenderPlatformV1ApiService } from '../../../spender-platform-v1-api.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { ReportPlatformParams } from 'src/app/core/models/platform/v1/reports-query-params.model';
import { PAGINATION_SIZE } from 'src/app/constants';

@Injectable({
  providedIn: 'root',
})
export class PlatformReportService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService
  ) {}

  getAllReportsByParams(queryParams: ReportPlatformParams): Observable<PlatformReport[]> {
    return this.getReportsCount(queryParams).pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getReportsByParams(queryParams, this.paginationSize * page, this.paginationSize)),
      reduce((acc, curr) => acc.concat(curr.data), [] as PlatformReport[])
    );
  }

  getReportsCount(queryParams?: ReportPlatformParams): Observable<number> {
    return this.getReportsByParams(queryParams).pipe(map((res) => res.count));
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
}
