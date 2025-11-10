import { Pipe, PipeTransform, inject } from '@angular/core';
import { FORMAT_PREFERENCES } from 'src/app/constants';
import { FormatPreferences } from 'src/app/core/models/format-preferences.model';

/**
 * This pipe is a superset of the default CurrencyPipe provided by Angular
 * It adds functionality to add a space between the currency code and the amount when no symbol is present for the given currency
 * Since this feature is not there by default, we need to add this by ourselves
 */
@Pipe({ name: 'currency' })
export class FyCurrencyPipe implements PipeTransform {
  private formatPreferences = inject<FormatPreferences>(FORMAT_PREFERENCES, { optional: true });

  // eslint-disable-next-line max-params-no-constructor/max-params-no-constructor
  transform(
    value: string | number | null,
    currencyCode?: string,
    display?: string | boolean,
    digitsInfo?: string,
    locale?: string,
  ): string {
    const placement = this.formatPreferences?.currencyFormat?.placement ?? 'before';
    const thousandSeparator = this.formatPreferences?.currencyFormat?.thousandSeparator ?? ',';
    const decimalSeparator = this.formatPreferences?.currencyFormat?.decimalSeparator ?? '.';

    const numericValue = typeof value === 'string' ? Number(value) : value;
    if (numericValue == null || Number.isNaN(numericValue)) {
      return '';
    }

    // Determine fraction digits
    let minFractionDigits: number | undefined;
    let maxFractionDigits: number | undefined;
    if (digitsInfo) {
      const match = /^(\d+)\.(\d+)-(\d+)$/.exec(digitsInfo);
      if (match) {
        // const minIntegerDigits = Number(match[1]); // not used
        minFractionDigits = Number(match[2]);
        maxFractionDigits = Number(match[3]);
      }
    }

    if (minFractionDigits == null || maxFractionDigits == null) {
      const nf = new Intl.NumberFormat(locale || 'en-US', {
        style: 'currency',
        currency: currencyCode || 'USD',
      });
      const resolved = nf.resolvedOptions();
      minFractionDigits = resolved.minimumFractionDigits ?? 2;
      maxFractionDigits = resolved.maximumFractionDigits ?? (minFractionDigits as number);
    }

    // Special-case zero when digitsInfo not explicitly provided: avoid decimals
    if (!digitsInfo && numericValue === 0) {
      minFractionDigits = 0;
      maxFractionDigits = 0;
    }

    const absVal = Math.abs(numericValue);

    // Build number core, then replace separators
    const decimalFormatter = new Intl.NumberFormat(locale || 'en-US', {
      style: 'decimal',
      useGrouping: true,
      minimumFractionDigits: minFractionDigits,
      maximumFractionDigits: maxFractionDigits,
    });
    const parts = decimalFormatter.formatToParts(absVal);
    let numberCore = '';
    for (const p of parts) {
      switch (p.type) {
        case 'integer':
        case 'fraction':
          numberCore += p.value;
          break;
        case 'group':
          numberCore += thousandSeparator;
          break;
        case 'decimal':
          numberCore += decimalSeparator;
          break;
        default:
          break;
      }
    }

    // Determine token based on display
    const currencyDisplayStyle: 'symbol' | 'code' =
      display === 'code' || display === false ? 'code' : 'symbol';
    let currencyToken = '';
    if (currencyCode) {
      const currencyFormatter = new Intl.NumberFormat(locale || 'en-US', {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: currencyDisplayStyle, // 'symbol-narrow' treated as 'symbol'
        minimumFractionDigits: minFractionDigits,
        maximumFractionDigits: maxFractionDigits,
      });
      const tokenParts = currencyFormatter.formatToParts(1);
      const currencyPart = tokenParts.find((p) => p.type === 'currency');
      currencyToken = currencyPart?.value || currencyCode;
    }

    const sign = numericValue < 0 ? '-' : '';
    if (placement === 'after') {
      return `${sign}${numberCore}${currencyToken ? currencyToken : ''}`;
    }
    return `${sign}${currencyToken ? currencyToken : ''}${numberCore}`;
  }
}
