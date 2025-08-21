import { Injectable, inject } from '@angular/core';
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
import { TranslocoService } from '@jsverse/transloco';

const customInputssCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CustomInputsService {
  private decimalPipe = inject(DecimalPipe);

  private datePipe = inject(DatePipe);

  private authService = inject(AuthService);

  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  private expenseFieldsService = inject(ExpenseFieldsService);

  private translocoService = inject(TranslocoService);

  @Cacheable({
    cacheBusterObserver: customInputssCacheBuster$,
  })
  getAll(active?: boolean): Observable<ExpenseField[]> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.spenderPlatformV1ApiService.get<PlatformApiResponse<PlatformExpenseField[]>>('/expense_fields', {
          params: {
            org_id: `eq.${eou.ou.org_id}`,
            is_custom: 'eq.true',
            ...(active !== undefined && { is_enabled: `eq.${active}` }), // Only add is_enabled if active is specified
          },
        }),
      ),
      map((res) => this.expenseFieldsService.transformFrom(res.data)),
    );
  }

  filterByCategory(customInputs: ExpenseField[], orgCategoryId: string): ExpenseField[] {
    return customInputs
      .filter((customInput) =>
        customInput.org_category_ids
          ? customInput.org_category_ids && customInput.org_category_ids.some((id) => id === Number(orgCategoryId))
          : true,
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

  fillCustomProperties(orgCategoryId: string, customProperties: Partial<CustomInput>[]): Observable<CustomField[]> {
    return this.getAll().pipe(
      // Call getAll without any arguments
      map((allCustomInputs) => allCustomInputs.filter((customInput) => customInput.type !== 'DEPENDENT_SELECT')),
      map((allCustomInputs) => {
        const customInputs = this.filterByCategory(allCustomInputs, orgCategoryId);

        // Sort custom inputs by rank
        customInputs.sort(this.sortByRank);

        const filledCustomProperties: CustomField[] = [];

        // Iterate through custom inputs and process each one
        for (const customInput of customInputs) {
          const fieldName =
            customInput.is_enabled === false
              ? `${customInput.field_name}${this.translocoService.translate('services.customInputs.deletedSuffix')}`
              : customInput.field_name;

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

          // Add the property to filledCustomProperties based on new logic
          if (this.shouldIncludeProperty(customInput, property)) {
            filledCustomProperties.push({
              ...property,
              displayValue: this.getCustomPropertyDisplayValue(property),
            });
          }
        }
        return filledCustomProperties;
      }),
    );
  }

  /**
   * Determines if a custom property should be included based on its enabled status and value.
   * @param customInput - The custom input field.
   * @param property - The custom field property.
   * @returns A boolean indicating whether the property should be included.
   */

  shouldIncludeProperty(customInput: ExpenseField, property: CustomField): boolean {
    return (
      customInput.is_enabled ||
      (!customInput.is_enabled &&
        property.value !== null &&
        property.value !== undefined &&
        this.getCustomPropertyDisplayValue(property) !== '-')
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
    if (customInput.type === 'SELECT') {
      property.value = ''; // Single select
    } else if (customInput.type === 'MULTI_SELECT') {
      property.value = []; // Multi-select
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
            (txCustomProperty) => txCustomProperty.name === customInput.field_name,
          );
          return {
            id: customInput.id,
            name: customInput.field_name,
            value: customProperty?.value,
            type: customInput.type,
            displayValue: customProperty?.value || '-',
            mandatory: customInput.is_mandatory,
          };
        }),
      ),
    );
  }

  private formatBooleanCustomProperty(customProperty: CustomField): string {
    return customProperty.value
      ? this.translocoService.translate('services.customInputs.yes')
      : this.translocoService.translate('services.customInputs.no');
  }

  private formatDateCustomProperty(customProperty: CustomField): string {
    return customProperty.value
      ? this.datePipe.transform(<string | number | Date>customProperty.value, 'MMM dd, yyyy')
      : '-';
  }

  private formatMultiselectCustomProperty(customProperty: CustomField): string {
    if (Array.isArray(customProperty.value) && customProperty.value.length > 0) {
      return customProperty.value.join(', ');
    }
    return '-';
  }

  private formatNumberCustomProperty(customProperty: CustomField): string {
    return customProperty.value ? this.decimalPipe.transform(<string | number>customProperty.value, '1.2-2') : '-';
  }

  private getLocationDisplayValue(displayValue: string, customProperty: CustomField): string {
    displayValue = '-';
    if (customProperty.value) {
      if (customProperty.value.hasOwnProperty('display')) {
        displayValue = (<{ display: string }>customProperty.value).display || '-';
      }
    }
    return displayValue;
  }
}
