import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { shareReplay, map } from 'rxjs/operators';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Cacheable } from 'ts-cacheable';
import { Subject } from 'rxjs';

const customInputssCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root'
})
export class CustomInputsService {

  constructor(
    private apiService: ApiService,
    private decimalPipe: DecimalPipe,
    private datePipe: DatePipe
  ) { }

  @Cacheable({
    cacheBusterObserver: customInputssCacheBuster$
  })
  getAll(active: boolean) {
    return this.apiService.get('/custom_inputs/custom_properties', { params: { active } }).pipe(
      shareReplay()
    );
  }

  filterByCategory(customInputs, orgCategoryId) {
    return customInputs
      .filter(
        customInput => customInput.org_category_ids ?
          customInput.org_category_ids && customInput.org_category_ids.some(id => id === orgCategoryId) : true
      ).sort();
  }

  // TODO: Siva - eventually this should be replaced by rank
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
        let customInputs = this.filterByCategory(allCustomInputs, orgCategoryId);

        // this should be by rank eventually
        customInputs.sort(this.sortByRank);

        let filledCustomProperties = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < customInputs.length; i++) {
          let customInput = customInputs[i];
          let property = {
            name: customInput.input_name,
            value: null,
            type: customInput.input_type,
            mandatory: customInput.mandatory,
            options: customInput.input_options
          };
          // defaults for types
          if (customInput.input_type === 'BOOLEAN') {
            property.value = false;
          } else if (customInput.input_type === 'SELECT' || customInput.input_type === 'MULTI_SELECT'){
            property.value = '';
          } else if (customInput.input_type === 'USER_LIST'){
            property.value = [];
          }
          if (customProperties) {
            // see if value is available
            // tslint:disable-next-line: prefer-for-of
            for (let j = 0; j < customProperties.length; j++) {
              if (customProperties[j].name === customInput.input_name) {
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
      displayValue = customProperty.value ? this.decimalPipe.transform(customProperty.value, '2') : '-';
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
  };
}
