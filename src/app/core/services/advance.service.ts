import { Injectable } from '@angular/core';
import { from, Observable, of, Subject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Cacheable, CacheBuster } from 'ts-cacheable';
import { ApiV2Response } from '../models/api-v2.model';
import { ExtendedAdvance } from '../models/extended_advance.model';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';
import { AdvancesPlatform } from '../models/platform/advances-platform.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { SpenderService } from './platform/v1/spender/spender.service';
import { PlatformConfig } from '../models/platform/platform-config.model';

const advancesCacheBuster$ = new Subject<void>();

type Config = Partial<{ offset: number; limit: number; assignee_ou_id?: string; queryParams: Record<string, string> }>;

@Injectable({
  providedIn: 'root',
})
export class AdvanceService {
  constructor(private spenderService: SpenderService) {}

  mapAdvance(advancesPlatform: AdvancesPlatform): ExtendedAdvance {
    return {
      adv_advance_number: advancesPlatform.seq_num,
      adv_amount: advancesPlatform.amount,
      adv_card_number: advancesPlatform.card_number,
      adv_created_at: advancesPlatform.created_at,
      adv_currency: advancesPlatform.currency,
      adv_exported: advancesPlatform.is_exported,
      adv_id: advancesPlatform.id,
      adv_issued_at: advancesPlatform.issued_at,
      adv_mode: advancesPlatform.payment_mode,
      adv_orig_amount: advancesPlatform.foreign_amount,
      adv_orig_currency: advancesPlatform.foreign_currency,
      adv_purpose: advancesPlatform.purpose,
      adv_refcode: advancesPlatform.code,
      adv_settlement_id: advancesPlatform.settlement_id,
      adv_source: advancesPlatform.source,
      areq_id: advancesPlatform.advance_request_id,
      assignee_department_id: advancesPlatform.employee.department && advancesPlatform.employee.department.id,
      assignee_ou_id: advancesPlatform.employee.id,
      assignee_ou_org_id: advancesPlatform.employee.org_id,
      assignee_us_email: advancesPlatform.employee.user.email,
      assignee_us_full_name: advancesPlatform.employee.user.full_name,
      project_code: advancesPlatform.project && advancesPlatform.project.code,
      project_id: advancesPlatform.project && advancesPlatform.project.id,
      project_name: advancesPlatform.project && advancesPlatform.project.name,
      type: 'advance',
      creator_us_full_name: advancesPlatform.creator_user.full_name,
    };
  }

  convertToPublicAdvance(advancesPlatformResponse: PlatformApiResponse<AdvancesPlatform>): ExtendedAdvance[] {
    return advancesPlatformResponse.data.map((advancesPlatform) => this.mapAdvance(advancesPlatform));
  }
  @Cacheable({
    cacheBusterObserver: advancesCacheBuster$,
  })
  getSpenderAdvances(
    config: PlatformConfig = {
      offset: 0,
      limit: 200,
      queryParams: {},
    }
  ): Observable<ApiV2Response<ExtendedAdvance>> {
    const params = {
      offset: config.offset,
      limit: config.limit,
    };
    return this.spenderService
      .get<PlatformApiResponse<AdvancesPlatform>>('/advances', {
        params,
      })
      .pipe(
        map((res) => {
          return {
            count: res.count,
            offset: res.offset,
            data: this.convertToPublicAdvance(res),
          };
        })
      );
  }
  @CacheBuster({
    cacheBusterNotifier: advancesCacheBuster$,
  })
  destroyAdvancesCacheBuster() {
    return of(null);
  }

  getAdvance(id: string): Observable<ExtendedAdvance> {
    return this.spenderService
      .get<PlatformApiResponse<AdvancesPlatform>>('/advances', {
        params: { id: `eq.${id}` },
      })
      .pipe(
        map((res) => {
          return this.fixDates(this.mapAdvance(res.data[0]));
        })
      );
  }

  getMyAdvancesCount(queryParams = {}) {
    return this.getSpenderAdvances({
      offset: 0,
      limit: 1,
      queryParams,
    }).pipe(map((advances) => advances.count));
  }

  private fixDates(data: ExtendedAdvance) {
    if (data && data.adv_created_at) {
      data.adv_created_at = new Date(data.adv_created_at);
    }

    if (data && data.adv_issued_at) {
      data.adv_issued_at = new Date(data.adv_issued_at);
    }

    return data;
  }
}
