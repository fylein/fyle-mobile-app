import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DependentFieldOption } from '../models/dependent-field-option.model';
import { DependentField } from '../models/dependent-field.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformDependentFieldValue } from '../models/platform/platform-dependent-field-value.model';
import { SpenderPlatformApiService } from './spender-platform-api.service';

@Injectable({
  providedIn: 'root',
})
export class DependentFieldsService {
  constructor(private spenderPlatformApiService: SpenderPlatformApiService) {}

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
    searchQuery: string;
    offset: number;
    limit: number;
  }) {
    const { offset, limit, fieldId, parentFieldId, parentFieldValue, searchQuery } = config;
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset,
        limit,
        expense_field_id: fieldId,
        parent_expense_field_id: parentFieldId,
        parent_expense_field_value: parentFieldValue,
        expense_field_value: searchQuery,
      },
    };

    return this.spenderPlatformApiService.get<PlatformApiResponse<PlatformDependentFieldValue>>(
      '/dependent_expense_field_values',
      data
    );
  }

  getOptionsForDependentFieldUtil(config: {
    fieldId: number;
    parentFieldId: number;
    parentFieldValue: string;
    searchQuery: string;
    offset: number;
    limit: number;
  }): Observable<DependentFieldOption[]> {
    const options = this.generateOptions(config.fieldId, config.parentFieldId, config.parentFieldValue);

    return of(options);
    //Show two options for every selected field
    // return of([options[config.parentValueId], options[(config.parentValueId * 2) % 10]]);
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
