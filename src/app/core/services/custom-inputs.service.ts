import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Cacheable } from 'ts-cacheable';
import { from, Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { ExpenseField } from '../models/v1/expense-field.model';
import { CustomField } from '../models/custom_field.model';
import { Expense } from '../models/expense.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformExpenseField } from '../models/platform/platform-expense-field.model';
import { ExpenseFieldsService } from './expense-fields.service';
import { CustomInput } from '../models/custom-input.model';
const customInputssCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CustomInputsService {
  constructor(
    private decimalPipe: DecimalPipe,
    private datePipe: DatePipe,
    private authService: AuthService,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService,
    private expenseFieldsService: ExpenseFieldsService
  ) {}

  @Cacheable({
    cacheBusterObserver: customInputssCacheBuster$,
  })
  getAll(active: boolean): Observable<ExpenseField[]> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.spenderPlatformV1ApiService.get<PlatformApiResponse<PlatformExpenseField[]>>('/expense_fields', {
          params: {
            org_id: `eq.${eou.ou.org_id}`,
            is_enabled: `eq.${active}`,
            is_custom: 'eq.true',
          },
        })
      ),
      map((res) => this.expenseFieldsService.transformFrom(res.data))
    );
  }

  // getAllinView is used to retrieve even disabled fields that has values to be displayed in view expense
  getAllinView(): Observable<ExpenseField[]> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.spenderPlatformV1ApiService.get<PlatformApiResponse<PlatformExpenseField[]>>('/expense_fields', {
          params: {
            org_id: `eq.${eou.ou.org_id}`,
            is_custom: 'eq.true',
          },
        })
      ),
      map((res) => this.expenseFieldsService.transformFrom(res.data))
    );
  }

  filterByCategory(customInputs: ExpenseField[], orgCategoryId: string | {}): ExpenseField[] {
    return customInputs
      .filter((customInput) =>
        customInput.org_category_ids
          ? customInput.org_category_ids && customInput.org_category_ids.some((id) => id === orgCategoryId)
          : true
      )
      .sort();
  }

  // TODO: eventually this should be replaced by rank (old app TODO)
  sortByRank(a: ExpenseField, b: ExpenseField): number {
    if (a.type > b.type) {
      return -1;
    }
    return 0;
  }

  fillCustomProperties(orgCategoryId: number, customProperties: Partial<CustomInput>[]): Observable<CustomField[]> {
    return this.getAllinView().pipe(
      // Filter out dependent selects
      map((allCustomInputs) => allCustomInputs.filter((customInput) => customInput.type !== 'DEPENDENT_SELECT')),
      map((allCustomInputs) => {
        const customInputs = this.filterByCategory(allCustomInputs, orgCategoryId);

        // Sort custom inputs by rank
        customInputs.sort(this.sortByRank);

        const filledCustomProperties: CustomField[] = [];

        // Iterate through custom inputs and process each one
        customInputs.forEach((customInput) => {
          // Set the field name, appending "(Deleted)" if the field is disabled
          const fieldName =
            customInput.is_enabled === false ? `${customInput.field_name} (Deleted)` : customInput.field_name;

          // Initialize the property object
          const property = {
            name: fieldName,
            value: null,
            type: customInput.type,
            mandatory: customInput.is_mandatory,
            options: customInput.options,
          };

          // Set default values based on the custom input type
          if (customInput.type === 'BOOLEAN') {
            property.value = false;
          }
          if (customInput.type === 'USER_LIST') {
            property.value = [];
          }

          // Handle select/multiselect values
          this.setSelectMultiselectValue(customInput, property);

          // Check if a value exists in `customProperties` and assign it
          if (customProperties) {
            const matchingCustomPropertyIndex = customProperties.findIndex((cp) => cp.name === customInput.field_name);
            if (matchingCustomPropertyIndex >= 0) {
              this.setCustomPropertyValue(property, customProperties, matchingCustomPropertyIndex);
            }
          }

          // Add the property to `filledCustomProperties` based on new logic
          // Include active fields
          // Include Disabled fields which has Historical values
          if (
            customInput.is_enabled ||
            (!customInput.is_enabled &&
              property.value !== null &&
              property.value !== undefined &&
              this.getCustomPropertyDisplayValue(property) !== '-')
          ) {
            filledCustomProperties.push({
              ...property,
              displayValue: this.getCustomPropertyDisplayValue(property),
            });
          }
        });
        return filledCustomProperties;
      })
    );
  }

  setCustomPropertyValue(property: CustomField, customProperties: Partial<CustomInput>[], index: number): void {
    if (property.type === 'DATE' && customProperties[index].value) {
      property.value = new Date(<string>customProperties[index].value);
    } else {
      property.value = customProperties[index].value;
    }
  }

  setSelectMultiselectValue(customInput: ExpenseField, property: CustomField): void {
    if (customInput.type === 'SELECT' || customInput.type === 'MULTI_SELECT') {
      property.value = '';
    }
  }

  getCustomPropertyDisplayValue(customProperty: CustomField): string {
    let displayValue = '-';

    if (customProperty.type === 'TEXT' || customProperty.type === 'SELECT') {
      displayValue = customProperty.value?.toString() || '-';
    } else if (customProperty.type === 'NUMBER') {
      displayValue = this.formatNumberCustomProperty(customProperty);
    } else if (customProperty.type === 'BOOLEAN') {
      displayValue = this.formatBooleanCustomProperty(customProperty);
    } else if (customProperty.type === 'MULTI_SELECT' || customProperty.type === 'USER_LIST') {
      displayValue = this.formatMultiselectCustomProperty(customProperty);
    } else if (customProperty.type === 'LOCATION') {
      displayValue = this.getLocationDisplayValue(displayValue, customProperty);
    } else if (customProperty.type === 'DATE') {
      displayValue = this.formatDateCustomProperty(customProperty);
    }

    return displayValue;
  }

  fillDependantFieldProperties(etxn: Expense): Observable<CustomField[]> {
    return this.getAll(true).pipe(
      map((allCustomInputs) => allCustomInputs.filter((customInput) => customInput.type === 'DEPENDENT_SELECT')),
      map((allCustomInputs) =>
        allCustomInputs.map((customInput) => {
          const customProperty = etxn.tx_custom_properties.find(
            (txCustomProperty) => txCustomProperty.name === customInput.field_name
          );
          return {
            id: customInput.id,
            name: customInput.field_name,
            value: customProperty?.value,
            type: customInput.type,
            displayValue: customProperty?.value || '-',
            mandatory: customInput.is_mandatory,
          };
        })
      )
    );
  }

  private formatBooleanCustomProperty(customProperty: CustomField): string {
    return customProperty.value ? 'Yes' : 'No';
  }

  private formatDateCustomProperty(customProperty: CustomField): string {
    return customProperty.value
      ? this.datePipe.transform(<string | number | Date>customProperty.value, 'MMM dd, yyyy')
      : '-';
  }

  private formatMultiselectCustomProperty(customProperty: CustomField): string {
    return customProperty.value && (<string[]>customProperty.value).length > 0
      ? (<string[]>customProperty.value).join(', ')
      : '-';
  }

  private formatNumberCustomProperty(customProperty: CustomField): string {
    return customProperty.value ? this.decimalPipe.transform(<string | number>customProperty.value, '1.2-2') : '-';
  }

  private getLocationDisplayValue(displayValue: string, customProperty: CustomField): string {
    displayValue = '-';
    if (customProperty.value) {
      if (customProperty.value.hasOwnProperty('display')) {
        displayValue = (<{ display: string }>customProperty.value).display || '-';
      } else {
        displayValue = customProperty.value.toString();
      }
    }
    return displayValue;
  }
}
