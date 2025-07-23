import { Pipe, PipeTransform } from '@angular/core';
import { FyCurrencyPipe } from './fy-currency.pipe';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({ name: 'humanizeCurrency', })
export class HumanizeCurrencyPipe implements PipeTransform {
  constructor(private fyCurrencyPipe: FyCurrencyPipe, private translocoService: TranslocoService) {}

  transform(value: number, currencyCode: string, skipSymbol = false, fraction?: number): string {
    const sign = value < 0 ? '-' : '';
    const amount = Math.abs(value) || 0;
    const si = [
      '',
      this.translocoService.translate('pipes.humanizeCurrency.kiloSuffix'),
      this.translocoService.translate('pipes.humanizeCurrency.megaSuffix'),
      this.translocoService.translate('pipes.humanizeCurrency.gigaSuffix'),
      this.translocoService.translate('pipes.humanizeCurrency.teraSuffix'),
      this.translocoService.translate('pipes.humanizeCurrency.quadrillionSuffix'),
      this.translocoService.translate('pipes.humanizeCurrency.quintillionSuffix'),
      this.translocoService.translate('pipes.humanizeCurrency.sextillionSuffix'),
      this.translocoService.translate('pipes.humanizeCurrency.septillionSuffix'),
      this.translocoService.translate('pipes.humanizeCurrency.octillionSuffix'),
      this.translocoService.translate('pipes.humanizeCurrency.nonillionSuffix'),
    ];
    const exp = Math.max(0, Math.floor(Math.log(amount) / Math.log(1000)));
    const result = amount / Math.pow(1000, exp);

    // Empty string overrides the currency symbol
    const symbolType = skipSymbol ? '' : 'symbol';

    // We need to pass digitsInfo in this format - {minIntergers}.{minDecimal}-{maxDecimal}
    const digitsInfo = amount === 0 ? '1.0-0' : fraction && `1.${fraction}-${fraction}`;

    let fixedResult = this.fyCurrencyPipe.transform(result, currencyCode, symbolType, digitsInfo);
    fixedResult = fixedResult + si[exp];

    return sign + fixedResult;
  }
}
