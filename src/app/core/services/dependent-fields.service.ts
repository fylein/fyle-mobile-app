import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformDependentFieldValue } from '../models/platform/platform-dependent-field-value.model';
import { CategoriesService } from './categories.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';

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
  }) {
    const { fieldId, parentFieldId, parentFieldValue, searchQuery } = config;
    const data = {
      params: {
        is_enabled: 'eq.true',
        offset: 'eq.0',
        limit: 'eq.20',
        expense_field_id: `eq.${fieldId}`,
        parent_expense_field_id: `eq.${parentFieldId}`,
        parent_expense_field_value: `eq.${parentFieldValue}`,
        expense_field_value: `ilike.%${searchQuery}%`,
      },
    };

    //TODO: Use v1 Platform APIs instead of v1-beta. Will be done once expense_fields is migrated
    return this.spenderPlatformV1ApiService.get<PlatformApiResponse<PlatformDependentFieldValue>>(
      '/dependent_expense_field_values',
      data
    );
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
