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

  formatCustomInput(customInput, customProperties) {
    /* Setting the name and mandatory based on the custom input key
     * Reason: Same method is used for expense custom fields and transport/advance request custom fields
     */
    const customInputName = customInput.field_name;

    let property = {
      id: customInput.id,
      name: customInput.field_name,
      value: null,
      placeholder: customInput.placeholder,
      type: customInput.type,
      mandatory: customInput.is_mandatory,
      options: customInput.options,
    };

    property = this.setDefaultValue(property, customInput.type);

    if (customProperties) {
      for (const customProperty of customProperties) {
        if (customProperty.name === customInputName) {
          property.value = customProperty.value;
          break;
        }
      }
    }
    return property;
  }

  standardizeCustomFields(customProperties, customInputs) {
    const filledCustomPropertiesWithType = customInputs.map((customInput) =>
      this.formatCustomInput(customInput, customProperties)
    );

    return filledCustomPropertiesWithType
      .sort((customField1, customField2) => this.sortcustomFieldsByType(customField1, customField2))
      .map((customField) => {
        if (customField.options) {
          customField.options = customField.options.map((option) => ({ label: option, value: option }));
        }
        return customField;
      });
  }
}
