import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency',
})
export class FyCurrencyPipe extends CurrencyPipe implements PipeTransform {
  transform(
    value: string | number,
    currencyCode?: string,
    display?: string | boolean,
    digitsInfo?: string,
    locale?: string
  ): null;

  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  transform(
    value: string | number,
    currencyCode?: string,
    display?: string | boolean,
    digitsInfo?: string,
    locale?: string
  ): string | null {
    const transformedValue = super.transform(value, currencyCode, display, digitsInfo, locale);

    if (transformedValue) {
      const firstDigitIdx = transformedValue.search(/\d/);
      const currencySymbol = transformedValue.substring(0, firstDigitIdx);

      if (currencySymbol === currencyCode) {
        return currencySymbol.concat(' ', transformedValue.substring(firstDigitIdx));
      }
    }

    return transformedValue;
  }
}
