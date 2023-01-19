import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DependentFieldOption } from '../models/dependent-field-option.model';
import { DependentField } from '../models/dependent-field.model';

@Injectable({
  providedIn: 'root',
})
export class DependentFieldsService {
  constructor() {}

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

  generateOptions(fieldId: number, parentFieldId: number) {
    const val = [];
    for (let i = 0; i <= 10; i++) {
      val.push({
        id: fieldId * i,
        name: `Parent field ${parentFieldId}, Option ${i}`,
        is_enabled: true,
        field_id: fieldId,
      });
    }
    return val;
  }

  getOptionsForDependentField(config: {
    fieldId: number;
    parentFieldId: number;
    parentValueId: number;
    searchQuery: string;
    offset: number;
    limit: number;
  }): Observable<DependentFieldOption[]> {
    const options = this.generateOptions(config.fieldId, config.parentFieldId);

    //Show two options for every selected field
    return of([options[config.parentValueId], options[(config.parentValueId * 2) % 10]]);
  }
}
