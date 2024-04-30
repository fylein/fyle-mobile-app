import { Inject, Injectable } from '@angular/core';
import { Observable, Subject, from, of, range } from 'rxjs';
import { catchError, concatMap, map, mergeMap, reduce, switchMap, tap } from 'rxjs/operators';
import { Report } from 'src/app/core/models/platform/v1/report.model';
import { SpenderPlatformV1ApiService } from '../../../spender-platform-v1-api.service';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { ReportsQueryParams } from 'src/app/core/models/platform/v1/reports-query-params.model';
import { PAGINATION_SIZE } from 'src/app/constants';
import { CreateDraftParams } from 'src/app/core/models/platform/v1/create-draft-params.model';
import { PlatformApiPayload } from 'src/app/core/models/platform/platform-api-payload.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService
  ) {}

  getAllReportsByParams(queryParams: ReportsQueryParams): Observable<Report[]> {
    return this.getReportsCount(queryParams).pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) => {
        let params = {
          state: queryParams.state,
          offset: this.paginationSize * page,
          limit: this.paginationSize,
        };
        return this.getReportsByParams(params);
      }),
      reduce((acc, curr) => acc.concat(curr.data), [] as Report[])
    );
  }

  getReportsCount(queryParams: ReportsQueryParams): Observable<number> {
    let params = {
      state: queryParams.state,
      limit: 1,
      offset: 0,
    };
    return this.getReportsByParams(params).pipe(map((res) => res.count));
  }

  getReportsByParams(queryParams: ReportsQueryParams = {}): Observable<PlatformApiResponse<Report[]>> {
    const config = {
      params: {
        ...queryParams,
      },
    };
    return this.spenderPlatformV1ApiService.get<PlatformApiResponse<Report[]>>('/reports', config);
  }

  createDraft(data: CreateDraftParams): Observable<Report> {
    return this.spenderPlatformV1ApiService
      .post<PlatformApiPayload<Report>>('/reports', data)
      .pipe(map((res) => res.data));
  }
}
