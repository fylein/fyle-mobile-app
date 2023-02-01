import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { DependentField } from '../models/dependent-field.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformDependentFieldValue } from '../models/platform/platform-dependent-field-value.model';
import { CategoriesService } from './categories.service';
import { SpenderPlatformApiService } from './spender-platform-api.service';

@Injectable({
  providedIn: 'root',
})
export class DependentFieldsService {
  constructor(
    private spenderPlatformApiService: SpenderPlatformApiService,
    private categoryService: CategoriesService
  ) {}

  //This is a dummy method and won't be needed as these fields will be provided in expense_fields api
  getDependentFields(): Observable<DependentField[]> {
    return of([
      {
        id: 1,
        name: 'Dependent Field 1',
        is_enabled: true,
        is_mandatory: true,
        placeholder: 'Select Field',
        dependent_field_id: 2,
      },
      {
        id: 2,
        name: 'Dependent Field 2',
        is_enabled: true,
        is_mandatory: false,
        placeholder: 'Select Field',
        dependent_field_id: 3,
      },
      {
        id: 3,
        name: 'Dependent Field 3',
        is_enabled: true,
        is_mandatory: true,
        placeholder: 'Select Field',
        dependent_field_id: 4,
      },
      {
        id: 4,
        name: 'Dependent Field 4',
        is_enabled: false,
        is_mandatory: false,
        placeholder: 'Select Field',
        dependent_field_id: 5,
      },
      {
        id: 5,
        name: 'Dependent Field 5',
        is_enabled: false,
        is_mandatory: true,
        placeholder: 'Select Field',
        dependent_field_id: null,
      },
    ]);
  }

  //Actual call to platform API
  getOptionsForDependentField(config: {
    fieldId: number;
    parentFieldId: number;
    parentFieldValue: string;
    searchQuery?: string;
  }) {
    const { fieldId, parentFieldId, parentFieldValue, searchQuery } = config;
    const data = {
      params: {
        is_enabled: `eq.${true}`,
        offset: 0,
        limit: 20,
        expense_field_id: fieldId,
        parent_expense_field_id: parentFieldId,
        parent_expense_field_value: parentFieldValue,
        expense_field_value: `=ilike.%${searchQuery}%`,
      },
    };

    return this.spenderPlatformApiService.get<PlatformApiResponse<PlatformDependentFieldValue>>(
      '/dependent_expense_field_values',
      data
    );
  }

  //Dummy method for testing, will be removed once APIs are available.
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

  private generateOptions(fieldId: number, parentFieldId: number, parentFieldValue: string) {
    const val = [];
    for (let i = 0; i <= 100; i++) {
      val.push({
        id: fieldId * i,
        name: `Parent field ${parentFieldId}, Value ${parentFieldValue}, Option ${i}`,
        is_enabled: true,
        field_id: fieldId,
      });
    }
    return val;
  }
}
