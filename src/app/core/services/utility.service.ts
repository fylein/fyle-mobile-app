import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { cloneDeep, isArray } from 'lodash';
import { SortingParam } from '../models/sorting-param.model';
import { SortingDirection } from '../models/sorting-direction.model';
import * as dayjs from 'dayjs';
import { CustomField } from '../models/custom_field.model';
import { Transaction } from '../models/v1/transaction.model';
import { ExtendedAdvanceRequest } from '../models/extended_advance_request.model';
import { TxnCustomProperties } from '../models/txn-custom-properties.model';
import { OperatorFunction } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  readonly EPOCH = 19700101;

  discardNullChar(str: string): string {
    return str.replace(/[\u0000][\u0008-\u0009][\u000A-\u000C][\u005C]/g, '');
  }

  refineNestedObject(customFields: CustomField[]): CustomField[] {
    return customFields.map((customField) => {
      if (
        ['TEXT', 'SELECT'].indexOf(customField.type) > -1 &&
        customField.value !== null &&
        customField.value !== undefined
      ) {
        customField.value = this.discardNullChar(<string>customField.value);
      }

      return customField;
    });
  }

  discardRedundantCharacters(data: Partial<Transaction>, fieldsToCheck: string[]): Partial<Transaction> {
    const dataCopy = { ...data };
    for (const property in dataCopy) {
      if (
        dataCopy.hasOwnProperty(property) &&
        fieldsToCheck.indexOf(property) > -1 &&
        dataCopy[property] !== null &&
        dataCopy[property] !== undefined
      ) {
        dataCopy[property] = this.discardNullChar(<string>dataCopy[property]);
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
  searchArrayStream<T>(searchText: string): OperatorFunction<
    {
      label: string;
      value: T;
    }[],
    {
      label: string;
      value: T;
    }[]
  > {
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

  traverse(
    x: TxnCustomProperties[] | TxnCustomProperties,
    callback: (x: TxnCustomProperties | Date) => TxnCustomProperties[] | Date
  ): TxnCustomProperties | TxnCustomProperties[] | Date {
    const that = this;
    if (isArray(x)) {
      return that.traverseArray(x, callback);
    } else if (typeof x === 'object' && x !== null && !(x instanceof Date)) {
      return that.traverseObject(x, callback);
    } else {
      return callback(x);
    }
  }

  traverseArray(
    arr: TxnCustomProperties[],
    callback: (x: TxnCustomProperties | Date) => TxnCustomProperties[] | Date
  ): TxnCustomProperties[] {
    const that = this;
    const modifiedArray: TxnCustomProperties[] = [];
    arr.forEach((x) => {
      modifiedArray.push(<TxnCustomProperties>that.traverse(x, callback));
    });
    return modifiedArray;
  }

  traverseObject(
    obj: TxnCustomProperties | TxnCustomProperties[],
    callback: (x: TxnCustomProperties | Date) => TxnCustomProperties[] | Date
  ): TxnCustomProperties | TxnCustomProperties[] {
    const that = this;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = that.traverse(<TxnCustomProperties>obj[key], callback);
      }
    }
    return obj;
  }

  sortAllAdvances(
    sortDir: SortingDirection,
    sortParam: SortingParam,
    advancesArray: ExtendedAdvanceRequest[]
  ): ExtendedAdvanceRequest[] {
    //used for sorting an array that has both advances and advance requests mixed together
    const sortedAdvancesArray = cloneDeep(advancesArray);

    return sortedAdvancesArray.sort((advance1, advance2) => {
      const sortingValue1 = this.getSortingValue(advance1, sortParam);
      const sortingValue2 = this.getSortingValue(advance2, sortParam);
      return this.compareSortingValues(sortingValue1, sortingValue2, sortDir, sortParam);
    });
  }

  getEmailsFromString(text: string): string[] {
    return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
  }

  getAmountWithCurrencyFromString(text: string): string[] {
    return text.match(/capped to ([a-zA-Z]{1,3} \d+)/i);
  }

  generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  private getSortingValue(advance: ExtendedAdvanceRequest, sortParam: SortingParam): dayjs.Dayjs | string {
    if (sortParam === SortingParam.creationDate) {
      return advance.areq_created_at ? dayjs(advance.areq_created_at) : dayjs(advance.adv_created_at);
    } else if (sortParam === SortingParam.approvalDate) {
      return advance.areq_approved_at ? dayjs(advance.areq_approved_at) : dayjs(this.EPOCH).toString();
    } else if (sortParam === SortingParam.project) {
      return advance.project_name;
    }
  }

  private compareSortingValues(
    sortingValue1: string | dayjs.Dayjs,
    sortingValue2: string | dayjs.Dayjs,
    sortDir: SortingDirection,
    sortingParam: SortingParam
  ): number {
    const returnValue = this.handleDefaultSort(sortingValue1, sortingValue2, sortingParam);
    if (returnValue !== null) {
      return returnValue;
    }

    if (typeof sortingValue1 === 'string') {
      if (sortDir === SortingDirection.ascending) {
        return sortingValue1.localeCompare(<string>sortingValue2) ? 1 : -1;
      } else {
        return sortingValue1.localeCompare(<string>sortingValue2) ? -1 : 1;
      }
    } else if (dayjs.isDayjs(sortingValue1)) {
      if (sortDir === SortingDirection.ascending) {
        return sortingValue1.isAfter(sortingValue2) ? 1 : -1;
      } else {
        return sortingValue1.isBefore(sortingValue2) ? 1 : -1;
      }
    }
  }

  private handleDefaultSort(
    sortingValue1: string | dayjs.Dayjs,
    sortingValue2: string | dayjs.Dayjs,
    sortingParam: SortingParam
  ): number {
    //handles cases where either sortingValue1 or sortingValue2 is null/undefined
    let nullComparator: string;
    if (sortingParam === SortingParam.project) {
      nullComparator = null;
    } else {
      nullComparator = dayjs(this.EPOCH).toString(); //needed to allow comparison using === without using comparison methods from moment library
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
