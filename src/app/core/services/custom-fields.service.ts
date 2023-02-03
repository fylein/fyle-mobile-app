import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CustomFieldsService {
  constructor() {}

  sortcustomFieldsByType(customField1, customField2) {
    if (customField1.type > customField2.type) {
      return -1;
    }

    if (customField1.type < customField2.type) {
      return 1;
    }
    return 0;
  }

  setDefaultValue(property, inputValue) {
    if (inputValue === 'BOOLEAN') {
      property.value = false;
    } else if (inputValue === 'SELECT' || inputValue === 'MULTI_SELECT') {
      property.value = '';
    } else if (inputValue === 'USER_LIST') {
      property.value = [];
    }

    return property;
  }

  setProperty(prefix, customInput, customProperties) {
    /* Setting the name and mandatory based on the custom input key
     * Reason: Same method is used for expense custom fields and transport/advance request custom fields
     */
    let customInputName;
    if (customInput.hasOwnProperty('field_name')) {
      customInputName = customInput.field_name;
    } else {
      customInputName = customInput[prefix + 'name'];
    }

    let customInputMandatory;
    if (customInput.hasOwnProperty('is_mandatory')) {
      customInputMandatory = customInput.is_mandatory;
    } else {
      customInputMandatory = customInput.mandatory;
    }

    let property = {
      id: customInput.id,
      prefix,
      name: customInputName,
      value: null,
      placeholder: customInput[prefix + 'placeholder'],
      type: customInput[prefix + 'type'],
      mandatory: customInputMandatory,
      options: customInput[prefix + 'options'],
    };

    property = this.setDefaultValue(property, customInput[prefix + 'type']);

    if (customProperties) {
      for (const customProperty of customProperties) {
        if (customProperty.name === customInputName) {
          if (property.type === 'DATE' && customProperty.value) {
            property.value = new Date(customProperty.value);
          } else {
            property.value = customProperty.value;
          }
          break;
        }
      }
    }
    return property;
  }

  standardizeCustomFields(customProperties, customInputs) {
    let prefix = '';

    const filledCustomPropertiesWithType = customInputs
      .filter((customInput) => !customInput.input_type)
      .map((customInput) => this.setProperty(prefix, customInput, customProperties));

    const filledCustomPropertiesWithInputType = customInputs
      .filter((customInput) => !customInput.type && customInput.input_type)
      .map((customInput) => {
        prefix = 'input_';
        return this.setProperty(prefix, customInput, customProperties);
      });

    return filledCustomPropertiesWithType.concat(filledCustomPropertiesWithInputType).sort(this.sortcustomFieldsByType);
  }
}
