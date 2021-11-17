import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { isArray } from 'lodash';
import { AdvancesStates } from '../models/advances-states.model';

type Filters = Partial<{
  state: AdvancesStates[];
  sortParam: string;
  sortDir: string;
}>;
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

  sortMixedAdvances(filters: Filters, advancesArray: any[]): any[] {
    let sortedAdvancesArray = advancesArray;
    if (filters && filters.sortDir && filters.sortParam) {
      if (filters.sortParam.includes('crDate')) {
        sortedAdvancesArray = sortedAdvancesArray.sort((adv1, adv2) => {
          const adv1Date = adv1.areq_created_at
            ? new Date(adv1.areq_created_at).getTime()
            : new Date(adv1.adv_created_at).getTime();
          const adv2Date = adv2.areq_created_at
            ? new Date(adv2.areq_created_at).getTime()
            : new Date(adv2.adv_created_at).getTime();

          if (filters.sortDir === 'asc') {
            return adv1Date > adv2Date ? 1 : -1;
          } else {
            return adv1Date < adv2Date ? 1 : -1;
          }
        });
      } else if (filters.sortParam.includes('appDate')) {
        sortedAdvancesArray = sortedAdvancesArray.sort((adv1, adv2) => {
          const adv1Date = new Date(adv1.areq_approved_at).getTime();
          const adv2Date = new Date(adv2.areq_approved_at).getTime();
          const nullDate = new Date(null).getTime(); //required because passing null to the Date constructor returns Jan 1, 1970

          const returnValue = this.handleDefaultSort(adv1Date, adv2Date, nullDate);
          if (returnValue !== null) {
            return returnValue;
          }

          if (filters.sortDir === 'asc') {
            return adv1Date > adv2Date ? 1 : -1;
          } else {
            return adv1Date < adv2Date ? 1 : -1;
          }
        });
      } else if (filters.sortParam.includes('project')) {
        sortedAdvancesArray = sortedAdvancesArray.sort((adv1, adv2) => {
          const adv1ProjectName = adv1.project_name;
          const adv2ProjectName = adv2.project_name;

          const returnValue = this.handleDefaultSort(adv1ProjectName, adv2ProjectName, null);
          if (returnValue !== null) {
            return returnValue;
          }

          if (filters.sortDir === 'asc') {
            return adv1ProjectName.localeCompare(adv2ProjectName) ? 1 : -1;
          } else {
            return adv1ProjectName.localeCompare(adv2ProjectName) ? -1 : 1;
          }
        });
      }
    }
    return sortedAdvancesArray;
  }

  private handleDefaultSort(param1: any, param2: any, nullComparator: any) {
    if (param1 === nullComparator && param2 === nullComparator) {
      return 0;
    } else if (param1 === nullComparator) {
      return 1;
    } else if (param2 === nullComparator) {
      return -1;
    } else {
      return null;
    }
  }
}
