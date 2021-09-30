import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { isArray } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor() {}

  discardNullChar(str) {
    return str.replace(/[\u0000][\u0008-\u0009][\u000A-\u000C][\u005C]/g, '');
  }

  refineNestedObject(customFields) {
    return customFields.map((customField) => {
      if (
        ['TEXT', 'SELECT'].indexOf(customField.type) > -1 &&
        customField.value !== null &&
        customField.value !== undefined
      ) {
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
        dataCopy[property] !== undefined
      ) {
        dataCopy[property] = this.discardNullChar(dataCopy[property]);
      } else if (property === 'custom_properties' && dataCopy.custom_properties) {
        dataCopy.custom_properties = this.refineNestedObject(dataCopy.custom_properties);
      }
    }

    return dataCopy;
  }

  /**
   *
   * @param searchText : search query entered by the user
   * Type variable <T> indicates that it is a generic method,
   * this means that the data type which will be specified at the time of a function call,
   * will also be the data type of the arguments and of the return value.
   * Detailed reference: https://www.tutorialsteacher.com/typescript/typescript-generic
   */
  searchArrayStream<T>(searchText: string) {
    return map((recentrecentlyUsedItems: { label: string; value: T }[]) => {
      if (searchText && searchText.length > 0) {
        const searchTextLowerCase = searchText.toLowerCase();
        return recentrecentlyUsedItems.filter(
          (item) =>
            item && item.label && item.label.length > 0 && item.label.toLocaleLowerCase().includes(searchTextLowerCase)
        );
      }
      return recentrecentlyUsedItems;
    });
  }

  traverse(x, callback) {
    const that = this;
    if (isArray(x)) {
      return that.traverseArray(x, callback);
    } else if (typeof x === 'object' && x !== null && !(x instanceof Date)) {
      return that.traverseObject(x, callback);
    } else {
      return callback(x);
    }
  }

  traverseArray(arr, callback) {
    const that = this;
    const modifiedArray = [];
    arr.forEach((x) => {
      modifiedArray.push(that.traverse(x, callback));
    });
    return modifiedArray;
  }

  traverseObject(obj, callback) {
    const that = this;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = that.traverse(obj[key], callback);
      }
    }
    return obj;
  }
}
