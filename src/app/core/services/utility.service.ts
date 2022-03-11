import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { cloneDeep, isArray } from 'lodash';
import { SortingParam } from '../models/sorting-param.model';
import { SortingDirection } from '../models/sorting-direction.model';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  readonly EPOCH = 19700101;

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

  sortAllAdvances(sortDir: SortingDirection, sortParam: SortingParam, advancesArray: any[]) {
    //used for sorting an array that has both advances and advance requests mixed together
    const sortedAdvancesArray = cloneDeep(advancesArray);

    return sortedAdvancesArray.sort((advance1, advance2) => {
      const sortingValue1 = this.getSortingValue(advance1, sortParam);
      const sortingValue2 = this.getSortingValue(advance2, sortParam);
      return this.compareSortingValues(sortingValue1, sortingValue2, sortDir, sortParam);
    });
  }

  private getSortingValue(advance: any, sortParam: SortingParam) {
    if (sortParam === SortingParam.creationDate) {
      return advance.areq_created_at ? moment(advance.areq_created_at) : moment(advance.adv_created_at);
    } else if (sortParam === SortingParam.approvalDate) {
      return advance.areq_approved_at ? moment(advance.areq_approved_at) : moment(this.EPOCH).toString();
    } else if (sortParam === SortingParam.project) {
      return advance.project_name;
    }
  }

  private compareSortingValues(
    sortingValue1: any,
    sortingValue2: any,
    sortDir: SortingDirection,
    sortingParam: SortingParam
  ) {
    const returnValue = this.handleDefaultSort(sortingValue1, sortingValue2, sortingParam);
    if (returnValue !== null) {
      return returnValue;
    }

    if (typeof sortingValue1 === 'string') {
      if (sortDir === SortingDirection.ascending) {
        return sortingValue1.localeCompare(sortingValue2) ? 1 : -1;
      } else {
        return sortingValue1.localeCompare(sortingValue2) ? -1 : 1;
      }
    } else if (moment.isMoment(sortingValue1)) {
      if (sortDir === SortingDirection.ascending) {
        return sortingValue1.isAfter(sortingValue2) ? 1 : -1;
      } else {
        return sortingValue1.isBefore(sortingValue2) ? 1 : -1;
      }
    }
  }

  private handleDefaultSort(sortingValue1: any, sortingValue2: any, sortingParam: SortingParam) {
    //handles cases where either sortingValue1 or sortingValue2 is null/undefined
    let nullComparator: any;
    if (sortingParam === SortingParam.project) {
      nullComparator = null;
    } else {
      nullComparator = moment(this.EPOCH).toString(); //needed to allow comparison using === without using comparison methods from moment library
    }
    if (sortingValue1 === nullComparator && sortingValue2 === nullComparator) {
      return 0;
    } else if (sortingValue1 === nullComparator) {
      return 1;
    } else if (sortingValue2 === nullComparator) {
      return -1;
    } else {
      return null;
    }
  }
}
