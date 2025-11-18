import { Pipe, PipeTransform, inject } from '@angular/core';
import { FyCurrencyPipe } from './fy-currency.pipe';
import { TranslocoService } from '@jsverse/transloco';
import { FORMAT_PREFERENCES } from 'src/app/constants';
import { FormatPreferences } from 'src/app/core/models/format-preferences.model';

@Pipe({ name: 'humanizeCurrency' })
export class HumanizeCurrencyPipe implements PipeTransform {
  private fyCurrencyPipe = inject(FyCurrencyPipe);

  private translocoService = inject(TranslocoService);

  private formatPreferences = inject<FormatPreferences>(FORMAT_PREFERENCES, { optional: true });

  transform(value: number, currencyCode: string, skipSymbol = false, fraction?: number): string {
    const sign = value < 0 ? '-' : '';
    const amount = Math.abs(value) || 0;

    // Abbreviation symbols
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

    if (amount === 0) {
      // Show plain 0 (no decimals)
      return this.fyCurrencyPipe.transform('0', currencyCode, skipSymbol ? '' : 'symbol', '1.0-0');
    }

    // Compute humanized exponent and scaled value
    const exp = Math.max(0, Math.floor(Math.log(amount) / Math.log(1000)));
    let scaled = amount / Math.pow(1000, exp);
    // Ensure within known suffix range by further scaling if needed
    if (exp > si.length - 1) {
      scaled = scaled * Math.pow(1000, exp + 1 - si.length);
    }

    // Format numeric part only (no currency token)
    const digitsInfo = fraction ? `1.${fraction}-${fraction}` : undefined;
    const numberOnly = this.fyCurrencyPipe.transform(scaled.toString(), undefined, '', digitsInfo) ?? '';

    // Append suffix tight to number (e.g., 104.03K)
    const numberWithSuffix = `${numberOnly}${si[Math.min(exp, si.length - 1)]}`;

    // Compose currency token per placement, unless skipping symbol
    const placement = this.formatPreferences?.currencyFormat?.placement ?? 'before';

    let currencyToken = '';
    if (!skipSymbol && currencyCode) {
      try {
        const nf = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currencyCode,
          currencyDisplay: 'symbol',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
        const parts = nf.formatToParts(1);
        currencyToken = parts.find((p) => p.type === 'currency')?.value || currencyCode;
      } catch {
        currencyToken = currencyCode;
      }
    }

    const needsSpace = !!currencyToken && !!currencyCode && currencyToken.toUpperCase() === currencyCode.toUpperCase();

    const composed =
      currencyToken && placement === 'after'
        ? `${numberWithSuffix}${needsSpace ? ' ' : ''}${currencyToken}`
        : `${currencyToken ? currencyToken + (needsSpace ? ' ' : '') : ''}${numberWithSuffix}`;

    return `${sign}${composed}`;
  }
}
