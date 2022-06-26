import { Pipe, PipeTransform } from '@angular/core';
import { FyCurrencyPipe } from './fy-currency.pipe';

@Pipe({
  name: 'humanizeCurrency',
})
export class HumanizeCurrencyPipe implements PipeTransform {
  constructor(private fyCurrencyPipe: FyCurrencyPipe) {}

  transform(value: number, currencyCode: string, skipSymbol = false, fraction?: number): any {
    const sign = value < 0 ? '-' : '';
    const amount = Math.abs(value) || 0;
    const si = ['', 'K', 'M', 'B', 't', 'q', 'Q', 's', 'S', 'o', 'n'];
    const exp = Math.max(0, Math.floor(Math.log(amount) / Math.log(1000)));
    const result = amount / Math.pow(1000, exp);

    const symbolType = skipSymbol ? '' : 'symbol';
    const digitsInfo = fraction && `1.${fraction}-${fraction}`;

    let fixedResult = this.fyCurrencyPipe.transform(result, currencyCode, symbolType, digitsInfo);
    if (fixedResult) {
      fixedResult = fixedResult + si[exp];
    }

    return sign + fixedResult;
  }
}
