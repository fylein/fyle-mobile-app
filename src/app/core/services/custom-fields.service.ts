import { Injectable } from '@angular/core';
import { CustomProperty } from '../models/custom-properties.model';
import { CustomInputsOption, TxnCustomProperties } from '../models/txn-custom-properties.model';
import { ExpenseField } from '../models/v1/expense-field.model';

@Injectable({
  providedIn: 'root',
})
export class CustomFieldsService {
  constructor() {}

  sortcustomFieldsByType(customField1: TxnCustomProperties, customField2: TxnCustomProperties): 1 | -1 | 0 {
    if (customField1.type > customField2.type) {
      return -1;
    }

    if (customField1.type < customField2.type) {
      return 1;
    }
    return 0;
  }

  setDefaultValue(property: TxnCustomProperties, inputValue: string): TxnCustomProperties {
    if (inputValue === 'BOOLEAN') {
      property.value = false;
    } else if (inputValue === 'SELECT' || inputValue === 'MULTI_SELECT') {
      property.value = '';
    } else if (inputValue === 'USER_LIST') {
      property.value = [];
    }

    return property;
  }

  setProperty(prefix: string, customInput: ExpenseField, customProperties: CustomProperty<any>[]): TxnCustomProperties {
    /* Setting the name and mandatory based on the custom input key
     * Reason: Same method is used for expense custom fields and transport/advance request custom fields
     */
    let customInputName: string;
    if (customInput.hasOwnProperty('field_name')) {
      customInputName = customInput.field_name;
    } else {
      customInputName = customInput[prefix + 'name'] as string;
    }

    let customInputMandatory;
    if (customInput.hasOwnProperty('is_mandatory')) {
      customInputMandatory = customInput.is_mandatory;
    } else {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      customInputMandatory = customInput['mandatory'] as boolean;
    }

    let property: TxnCustomProperties = {
      id: customInput.id,
      prefix,
      name: customInputName,
      value: null,
      placeholder: customInput[prefix + 'placeholder'] as string,
      type: customInput[prefix + 'type'] as string,
      mandatory: customInputMandatory as boolean,
      options: customInput[prefix + 'options'] as CustomInputsOption[],
      parent_field_id: customInput.parent_field_id,
    };

    property = this.setDefaultValue(property, customInput[prefix + 'type'] as string);

    if (customProperties) {
      for (const customProperty of customProperties) {
        if (customProperty.name === customInputName) {
          if (property.type === 'DATE' && customProperty.value) {
            // TODO: Check if this is required since the value is null by default
            property.value = new Date(customProperty.value as string);
          } else {
            property.value = customProperty.value as string;
          }
          break;
        }
      }
    }

    return property;
  }

  standardizeCustomFields(
    customProperties: CustomProperty<any>[],
    customInputs: ExpenseField[]
  ): TxnCustomProperties[] {
    let prefix = '';

    const filledCustomPropertiesWithType = customInputs
      .filter((customInput) => !customInput.input_type)
      .map((customInput) => this.setProperty(prefix, customInput, customProperties));

    // TODO: Check if this is required since we use the same method for expense custom fields and advance request custom fields
    const filledCustomPropertiesWithInputType = customInputs
      .filter((customInput) => !customInput.type && customInput.input_type)
      .map((customInput) => {
        prefix = 'input_';
        return this.setProperty(prefix, customInput, customProperties);
      });

    return filledCustomPropertiesWithType.concat(filledCustomPropertiesWithInputType).sort(this.sortcustomFieldsByType);
  }
}
