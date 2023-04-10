import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Cacheable } from 'ts-cacheable';
import { DependentFieldValuesApiParams } from '../models/platform/dependent-field-values-api-params.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformDependentFieldValue } from '../models/platform/platform-dependent-field-value.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { CustomInputsService } from './custom-inputs.service';
import { switchMap } from 'rxjs/operators';
import { ExpenseField } from '../models/v1/expense-field.model';

@Injectable({
  providedIn: 'root',
})
export class DependentFieldsService {
  constructor(
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private customInputsService: CustomInputsService
  ) {}

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

  //This method returns array of dependent field names based on id of base field - Project, Cost center, etc.
  getDependentFieldsForBaseField(parentFieldId: number): Observable<ExpenseField[]> {
    return this.customInputsService.getAll(true).pipe(
      map((customFields) => customFields.filter((customField) => customField.type === 'DEPENDENT_SELECT')),
      switchMap((expenseFields) => {
        const dependentExpenseFields = [];
        while (parentFieldId) {
          const nextDependentField = expenseFields.find(
            (expenseField) => expenseField.parent_field_id === parentFieldId
          );
          if (nextDependentField) {
            dependentExpenseFields.push(nextDependentField);
          }
          parentFieldId = nextDependentField?.id;
        }
        return of(dependentExpenseFields);
      })
    );
  }
}
