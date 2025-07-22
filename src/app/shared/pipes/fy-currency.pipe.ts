import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * This pipe is a superset of the default CurrencyPipe provided by Angular
 * It adds functionality to add a space between the currency code and the amount when no symbol is present for the given currency
 * Since this feature is not there by default, we need to add this by ourselves
 */
@Pipe({
  name: 'currency',
  standalone: true,
})
export class FyCurrencyPipe implements PipeTransform {
  constructor(private currencyPipe: CurrencyPipe) {}

  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  transform(
    value: string | number | null,
    currencyCode?: string,
    display?: string | boolean,
    digitsInfo?: string,
    locale?: string
  ): string | null {
    // When amount passed is 0 avoid adding decimal point
    if (value === 0) {
      digitsInfo = '1.0-0';
    }
    const transformedValue = this.currencyPipe.transform(value, currencyCode, display, digitsInfo, locale);

    if (transformedValue) {
      // Gets the index of first digit in the transformed amount string
      const firstDigitIdx = transformedValue.search(/\d/);
      const hasNegativeSign = transformedValue.startsWith('-');

      // If the transformed string has a negative sign, we need to avoid it as we just want the currency symbol
      const currencySymbol = transformedValue.substring(hasNegativeSign ? 1 : 0, firstDigitIdx);

      /**
       * If the symbol is same as the currency code, we need to add a space for proper readability
       * This can happen when there is no symbol for the given currency code. e.g. OMR has no currency symbol
       * In this case we would like to override the default behaviour of showing OMR5.000 and change it to OMR 5.000
       */
      if (currencySymbol === currencyCode) {
        return transformedValue.replace(currencySymbol, currencySymbol.concat(' '));
      }
    }

    return transformedValue;
  }
}
