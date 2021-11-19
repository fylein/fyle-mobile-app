import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { isArray } from 'lodash';
import { SortingParam } from '../models/sorting-param.model';
import { SortingDirection } from '../models/sorting-direction.model';
import * as moment from 'moment';

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

  sortAllAdvances(sortDir: SortingDirection, sortParam: SortingParam, advancesArray: any[]): any[] {
    //used for sorting an array that has both advances and advance requests mixed together
    let sortedAdvancesArray = advancesArray;
    if (sortParam === SortingParam.creationDate) {
      sortedAdvancesArray = sortedAdvancesArray.sort((adv1, adv2) => {
        const adv1Date = adv1.areq_created_at ? moment(adv1.areq_created_at) : moment(adv1.adv_created_at);
        const adv2Date = adv2.areq_created_at ? moment(adv2.areq_created_at) : moment(adv2.adv_created_at);

        if (sortDir === SortingDirection.ascending) {
          return adv1Date.isAfter(adv2Date) ? 1 : -1;
        } else {
          return adv1Date.isBefore(adv2Date) ? 1 : -1;
        }
      });
    } else if (sortParam === SortingParam.approvalDate) {
      sortedAdvancesArray = sortedAdvancesArray.sort((adv1, adv2) => {
        const adv1Date = adv1.areq_approved_at ? moment(adv1.areq_approved_at) : moment(19700101);
        const adv2Date = adv2.areq_approved_at ? moment(adv2.areq_approved_at) : moment(19700101);

        const returnValue = this.handleDefaultSort(adv1Date, adv2Date, moment(19700101));
        if (returnValue !== null) {
          return returnValue;
        }

        if (sortDir === SortingDirection.ascending) {
          return adv1Date.isAfter(adv2Date) ? 1 : -1;
        } else {
          return adv1Date.isBefore(adv2Date) ? 1 : -1;
        }
      });
    } else if (sortParam === SortingParam.project) {
      sortedAdvancesArray = sortedAdvancesArray.sort((adv1, adv2) => {
        const adv1ProjectName = adv1.project_name;
        const adv2ProjectName = adv2.project_name;

        const returnValue = this.handleDefaultSort(adv1ProjectName, adv2ProjectName, null);
        if (returnValue !== null) {
          return returnValue;
        }

        if (sortDir === SortingDirection.ascending) {
          return adv1ProjectName.localeCompare(adv2ProjectName) ? 1 : -1;
        } else {
          return adv1ProjectName.localeCompare(adv2ProjectName) ? -1 : 1;
        }
      });
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
