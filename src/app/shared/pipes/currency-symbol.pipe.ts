import { getCurrencySymbol } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencySymbol' })
export class CurrencySymbolPipe implements PipeTransform {
  transform(currencyCode: string, format: 'wide' | 'narrow' = 'narrow'): string {
    if (currencyCode) {
      const currencySymbol = getCurrencySymbol(currencyCode, format);

      if (currencySymbol) {
        return currencySymbol;
      }
    }

    return '';
  }
}
