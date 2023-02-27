import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformDependentFieldValue } from '../models/platform/platform-dependent-field-value.model';
import { CategoriesService } from './categories.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';

interface DependentFieldValuesApiParams {
  params: {
    expense_field_id: string;
    parent_expense_field_id: string;
    parent_expense_field_value: string;
    expense_field_value?: string;
    is_enabled?: string;
    offset?: number;
    limit?: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DependentFieldsService {
  constructor(
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private categoryService: CategoriesService
  ) {}

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
        parent_expense_field_value: `eq.${parentFieldValue}`,
        is_enabled: 'eq.true',
        offset: 0,
        limit: 20,
      },
    };

    if (searchQuery?.length) {
      data.params.expense_field_value = `ilike.%${searchQuery}%`;
    }

    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformDependentFieldValue>>('/dependent_expense_field_values', data)
      .pipe(map((res) => res.data));
  }

  //TODO: Remove this dummy method once APIs are available
  getOptionsForDependentFieldUtil(config: {
    fieldId: number;
    parentFieldId: number;
    parentFieldValue: string;
    searchQuery?: string;
  }): Observable<PlatformDependentFieldValue[]> {
    return this.categoryService
      .getCategories({
        offset: 0,
        limit: 20,
      })
      .pipe(
        map((categories) =>
          categories.map((category) => ({
            id: category.id,
            created_at: category.created_at,
            updated_at: category.updated_at,
            org_id: category.org_id,
            is_enabled: true,
            parent_expense_field_value: config.parentFieldValue,
            expense_field_value: category.displayName,
          }))
        )
      );
  }
}
