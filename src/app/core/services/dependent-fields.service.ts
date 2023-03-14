import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Cacheable } from 'ts-cacheable';
import { DependentFieldValuesApiParams } from '../models/platform/dependent-field-values-api-params.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformDependentFieldValue } from '../models/platform/platform-dependent-field-value.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';

@Injectable({
  providedIn: 'root',
})
export class DependentFieldsService {
  constructor(private spenderPlatformV1ApiService: SpenderPlatformV1ApiService) {}

  //Cache response for 5 unique configurations for config object
  //This avoids repetitive calls if user opens the parent modal again after changing child field
  @Cacheable({
    maxCacheCount: 5,
  })
  getOptionsForDependentField(config: {
    fieldId: number;
    parentFieldId: number;
    parentFieldValue: string;
    searchQuery?: string;
  }): Observable<PlatformDependentFieldValue[]> {
    const { fieldId, parentFieldId, parentFieldValue, searchQuery } = config;
    const data: DependentFieldValuesApiParams = {
      params: {
        expense_field_id: `eq.${fieldId}`,
        parent_expense_field_id: `eq.${parentFieldId}`,
        parent_expense_field_value: `eq."${parentFieldValue}"`,
        is_enabled: 'eq.true',
        offset: 0,
        limit: 20,
        order: 'expense_field_value.asc',
      },
    };

    if (searchQuery?.length) {
      data.params.expense_field_value = `ilike."%${searchQuery}%"`;
    }

    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformDependentFieldValue>>('/dependent_expense_field_values', data)
      .pipe(map((res) => res.data));
  }
}
