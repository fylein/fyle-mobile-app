import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map, switchMap } from 'rxjs/operators';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Cacheable } from 'ts-cacheable';
import { from, Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { ExpenseField } from '../models/v1/expense-field.model';

const customInputssCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root'
})
export class CustomInputsService {

  constructor(
    private apiService: ApiService,
    private decimalPipe: DecimalPipe,
    private datePipe: DatePipe,
    private authService: AuthService
  ) { }

  @Cacheable({
    cacheBusterObserver: customInputssCacheBuster$
  })
  getAll(active: boolean = false): Observable<ExpenseField[]> {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => this.apiService.get('/expense_fields', {
        params: {
          org_id: eou.ou.org_id,
          is_enabled: active,
          is_custom: true
        }
      }))
    );
  }

  filterByCategory(customInputs, orgCategoryId) {
    return customInputs
      .filter(
        customInput => customInput.org_category_ids ?
          customInput.org_category_ids && customInput.org_category_ids.some(id => id === orgCategoryId) : true
      ).sort();
  }

  // TODO: eventually this should be replaced by rank (old app TODO)
  sortByRank(a, b) {
    if (a.type > b.type) {
      return -1;
    }
    if (a.input_type < b.input_type) {
      return 1;
    }
    return 0;
  }

  fillCustomProperties(orgCategoryId, customProperties, active) {
    return this.getAll(active).pipe(
      map(allCustomInputs => {
        const customInputs = this.filterByCategory(allCustomInputs, orgCategoryId);

        // this should be by rank eventually
        customInputs.sort(this.sortByRank);

        const filledCustomProperties = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < customInputs.length; i++) {
          const customInput = customInputs[i];
          const property = {
            name: customInput.field_name,
            value: null,
            type: customInput.type,
            mandatory: customInput.is_mandatory,
            options: customInput.options
          };
          // defaults for types
          if (customInput.type === 'BOOLEAN') {
            property.value = false;
          } else if (customInput.type === 'SELECT' || customInput.type === 'MULTI_SELECT'){
            property.value = '';
          } else if (customInput.type === 'USER_LIST'){
            property.value = [];
          }
          if (customProperties) {
            // see if value is available
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let j = 0; j < customProperties.length; j++) {
              if (customProperties[j].name === customInput.field_name) {
                if (property.type === 'DATE' && customProperties[j].value) {
                  property.value = new Date(customProperties[j].value);
                } else {
                  property.value = customProperties[j].value;
                }
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

  getCustomPropertyDisplayValue(customProperty) {
    let displayValue = '-';

    if (customProperty.type === 'TEXT' || customProperty.type === 'SELECT') {
      displayValue = customProperty.value || '-';
    } else if (customProperty.type === 'NUMBER') {
      displayValue = customProperty.value ? this.decimalPipe.transform(customProperty.value, '1.2-2') : '-';
    }  else if (customProperty.type === 'BOOLEAN') {
      displayValue = customProperty.value ? 'Yes' : 'No';
    } else if (customProperty.type === 'MULTI_SELECT' || customProperty.type === 'USER_LIST') {
      displayValue = (customProperty.value && customProperty.value.length > 0) ? customProperty.value.join(', ') : '-';
    } else if (customProperty.type === 'LOCATION') {
      displayValue = '-';
      if (customProperty.value) {
        if (customProperty.value.hasOwnProperty('display')) {
          displayValue = customProperty.value.display ? customProperty.value.display || '-' : '-';
        } else {
          displayValue = customProperty.value ? customProperty.value || '-' : '-';
        }
      }
    } else if (customProperty.type === 'DATE') {
      displayValue = customProperty ? this.datePipe.transform(customProperty.value, 'MMM dd, yyyy') : '-';
    }

    return displayValue;
  }
}
