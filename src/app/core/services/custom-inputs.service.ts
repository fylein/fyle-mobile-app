import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map, switchMap } from 'rxjs/operators';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Cacheable } from 'ts-cacheable';
import { from, Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { ExpenseField } from '../models/v1/expense-field.model';
import { CustomField } from '../models/custom_field.model';
import { CustomProperty } from '../models/custom-properties.model';
const customInputssCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CustomInputsService {
  constructor(
    private apiService: ApiService,
    private decimalPipe: DecimalPipe,
    private datePipe: DatePipe,
    private authService: AuthService
  ) {}

  @Cacheable({
    cacheBusterObserver: customInputssCacheBuster$,
  })
  getAll(active: boolean): Observable<ExpenseField[]> {
    return from(this.authService.getEou()).pipe(
      switchMap((eou) =>
        this.apiService.get('/expense_fields', {
          params: {
            org_id: eou.ou.org_id,
            is_enabled: active,
            is_custom: true,
          },
        })
      )
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

  fillCustomProperties(
    orgCategoryId: number,
    customProperties: CustomProperty<any>[],
    active: boolean
  ): Observable<CustomField[]> {
    return this.getAll(active).pipe(
      map((allCustomInputs) => {
        const customInputs = this.filterByCategory(allCustomInputs, orgCategoryId);

        // this should be by rank eventually
        customInputs.sort(this.sortByRank);

        const filledCustomProperties: CustomField[] = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < customInputs.length; i++) {
          const customInput = customInputs[i];
          const property = {
            name: customInput.field_name,
            value: null,
            type: customInput.type,
            mandatory: customInput.is_mandatory,
            options: customInput.options,
          };
          // defaults for types
          if (customInput.type === 'BOOLEAN') {
            property.value = false;
          }

          this.setSelectMultiselectValue(customInput, property);

          if (customInput.type === 'USER_LIST') {
            property.value = [];
          }

          if (customProperties) {
            // see if value is available
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let j = 0; j < customProperties.length; j++) {
              if (customProperties[j].name === customInput.field_name) {
                this.setCustomPropertyValue(property, customProperties, j);
                break;
              }
            }
          }
          filledCustomProperties.push(property);
        }
        return filledCustomProperties;
      })
    );
  }

  setCustomPropertyValue(property: CustomField, customProperties: CustomField[], index: number) {
    if (property.type === 'DATE' && customProperties[index].value) {
      property.value = new Date(customProperties[index].value);
    } else {
      property.value = customProperties[index].value;
    }
  }

  setSelectMultiselectValue(customInput: ExpenseField, property: CustomField) {
    if (customInput.type === 'SELECT' || customInput.type === 'MULTI_SELECT') {
      property.value = '';
    }
  }

  getCustomPropertyDisplayValue(customProperty: CustomField): string {
    let displayValue = '-';

    if (customProperty.type === 'TEXT' || customProperty.type === 'SELECT') {
      displayValue = customProperty.value || '-';
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

  private formatBooleanCustomProperty(customProperty: CustomField): string {
    return customProperty.value ? 'Yes' : 'No';
  }

  private formatDateCustomProperty(customProperty: CustomField): string {
    return customProperty.value ? this.datePipe.transform(customProperty.value, 'MMM dd, yyyy') : '-';
  }

  private formatMultiselectCustomProperty(customProperty: CustomField): string {
    return customProperty.value && customProperty.value.length > 0 ? customProperty.value.join(', ') : '-';
  }

  private formatNumberCustomProperty(customProperty: CustomField): string {
    return customProperty.value ? this.decimalPipe.transform(customProperty.value, '1.2-2') : '-';
  }

  private getLocationDisplayValue(displayValue: string, customProperty: CustomField): string {
    displayValue = '-';
    if (customProperty.value) {
      if (customProperty.value.hasOwnProperty('display')) {
        displayValue = customProperty.value.display || '-';
      } else {
        displayValue = customProperty.value;
      }
    }
    return displayValue;
  }
}
