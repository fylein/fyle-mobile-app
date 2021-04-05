import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor() { }

  discardNullChar(str) {
    return str.replace(/[\u0000][\u0008-\u0009][\u000A-\u000C][\u005C]/g, '');
  }


  refineNestedObject(customFields) {
    return customFields.map((customField) => {
      if (['TEXT', 'SELECT'].indexOf(customField.type) > -1 && customField.value !== null && customField.value !== undefined) {
        customField.value = this.discardNullChar(customField.value);
      }

      return customField;
    });
  }


  discardRedundantCharacters(data, fieldsToCheck) {
    const dataCopy = { ...data };
    for (const property in dataCopy) {
      if (
        dataCopy.hasOwnProperty(property) &&
        fieldsToCheck.indexOf(property) > -1 &&
        dataCopy[property] !== null &&
        dataCopy[property] !== undefined) {
        dataCopy[property] = this.discardNullChar(dataCopy[property]);
      } else if (property === 'custom_properties' && dataCopy.custom_properties) {
        dataCopy.custom_properties = this.refineNestedObject(dataCopy.custom_properties);
      }
    }

    return dataCopy;
  }


  searchArrayStream<T>(searchText: string) {
    return map((recentrecentlyUsedItems: {label: string, value: T} [] ) => {
      if (searchText && searchText.length > 0) {
        var searchTextLowerCase = searchText.toLowerCase();
        return recentrecentlyUsedItems.filter(item => {
          return item && item.label && item.label.length > 0 && item.label.toLocaleLowerCase().includes(searchTextLowerCase);
        });
      }
      return recentrecentlyUsedItems;
    });
  }
}
