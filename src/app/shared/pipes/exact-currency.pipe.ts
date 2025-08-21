import { Pipe, PipeTransform, inject } from '@angular/core';
import { FyCurrencyPipe } from './fy-currency.pipe';
import { CurrencyPipeConfig } from 'src/app/core/models/currency-pipe-config.model';

@Pipe({
  name: 'exactCurrency',
  standalone: false,
})
export class ExactCurrencyPipe implements PipeTransform {
  private fyCurrencyPipe = inject(FyCurrencyPipe);

  transform(config: CurrencyPipeConfig): string {
    const { value, currencyCode, skipSymbol = false, fraction } = config;
    const sign = value < 0 ? '-' : '';
    const amount = Math.abs(value) || 0;
    const symbolType = skipSymbol ? '' : 'symbol';
    const digitsInfo = amount === 0 ? '1.0-0' : fraction && `1.${fraction}-${fraction}`;

    // Format the exact amount
    const formattedValue = this.fyCurrencyPipe.transform(amount, currencyCode, symbolType, digitsInfo);
    return sign + formattedValue;
  }
}
