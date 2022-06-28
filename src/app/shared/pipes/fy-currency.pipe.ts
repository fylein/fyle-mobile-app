import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * This pipe is a superset of the default CurrencyPipe provided by Angular
 * It adds functionality to add a space between the currency code and the amount when no symbol is present for the given currency
 * Since this feature is not there by default, we need to add this by ourselves
 * For e.g., USD100.00 will be transformed to USD 100.00
 */
@Pipe({
  name: 'currency',
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
    const transformedValue = this.currencyPipe.transform(value, currencyCode, display, digitsInfo, locale);

    if (transformedValue) {
      // Gets the index of first digit in the transformed amount string
      const firstDigitIdx = transformedValue.search(/\d/);
      const currencySymbol = transformedValue.substring(0, firstDigitIdx);

      // If the symbol is same as the currency code, we need to add a space for proper readability
      if (currencySymbol === currencyCode) {
        return currencySymbol.concat(' ', transformedValue.substring(firstDigitIdx));
      }
    }

    return transformedValue;
  }
}
