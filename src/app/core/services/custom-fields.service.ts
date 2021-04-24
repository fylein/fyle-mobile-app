import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomFieldsService {

  constructor() { }

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
    console.log("check custom input in setproperty", customInput);
    let property = {
      id: customInput.id,
      prefix,
      name: customInput[prefix + 'name'],
      value: null,
      placeholder: customInput[prefix + 'placeholder'],
      type: customInput[prefix + 'type'],
      mandatory: customInput.is_mandatory,
      options: customInput[prefix + 'options']
    };

    property = this.setDefaultValue(property, customInput[prefix + 'type']);

    if (customProperties) {
      for (const customProperty of customProperties) {
        if (customProperty.field_name === customInput[prefix + 'name']) {
          if (property.type === 'DATE' && customProperty.value) {
            property.value = new Date(customProperty.value);
          } else {
            property.value = customProperty.value;
          }
          break;
        }
      }

    }
    console.log("check property", property);
    return property;
  }

  standardizeCustomFields(customProperties, customInputs) {
    console.log("check customProperties in standardizeCustomFields", customProperties);
    console.log("check customInputs in standardizeCustomFields", customInputs);

    let prefix = '';

    const filledCustomPropertiesWithType = customInputs.filter((customInput) => {
      console.log("check input -->>", customInput.type);
      return !customInput.type;
    }).map((customInput) => {
      console.log("check input in map -->>", prefix, customInput, customProperties);
      return this.setProperty(prefix, customInput, customProperties);
    });

    console.log("check the filled custom properties with type->",filledCustomPropertiesWithType)

    const filledCustomPropertiesWithInputType = customInputs.filter((customInput) => {
      return !customInput.type && customInput.type;
    }).map((customInput) => {
      prefix = 'input_';
      return this.setProperty(prefix, customInput, customProperties);
    });

    console.log("check filledCustomPropertiesWithInputType", filledCustomPropertiesWithInputType);

    return filledCustomPropertiesWithType.concat(filledCustomPropertiesWithInputType).sort(this.sortcustomFieldsByType);
  }

  standardizeProperties(customProperties) {
    const changedCustomProperties = customProperties.map((customProperty) => {
      return {
        id: customProperty.id,
        name: customProperty.field_name,
        value: customProperty.value,
        type: customProperty.type
      };
    });

    return changedCustomProperties;
  };
}
