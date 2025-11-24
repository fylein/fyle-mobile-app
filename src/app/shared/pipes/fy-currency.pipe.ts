import { Pipe, PipeTransform, inject } from '@angular/core';
import { FORMAT_PREFERENCES } from 'src/app/constants';
import { FormatPreferences } from 'src/app/core/models/format-preferences.model';
import currency from 'currency.js';

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
    const numericValue = typeof value === 'string' ? Number(value) : value;
    if (numericValue == null || Number.isNaN(numericValue)) {
      return '';
    }

    const placement = this.formatPreferences?.currencyFormat?.placement ?? 'before';
    const thousandSeparator = this.formatPreferences?.currencyFormat?.thousandSeparator ?? ',';
    const decimalSeparator = this.formatPreferences?.currencyFormat?.decimalSeparator ?? '.';

    // Determine precision from digitsInfo or currency defaults
    let precision = 2;

    if (digitsInfo) {
      const match = /^(\d+)\.(\d+)-(\d+)$/.exec(digitsInfo);
      if (match) {
        // match[2] = minFractionDigits, match[3] = maxFractionDigits
        precision = Number(match[3]);
      }
    } else if (numericValue === 0) {
      // Special-case zero when digitsInfo not explicitly provided: avoid decimals
      precision = 0;
    } else if (currencyCode) {
      const nf = new Intl.NumberFormat(locale || 'en-US', {
        style: 'currency',
        currency: currencyCode,
      });
      const resolved = nf.resolvedOptions();
      precision = resolved.maximumFractionDigits ?? resolved.minimumFractionDigits ?? precision;
    }

    // Determine token based on display
    const currencyDisplayStyle: 'symbol' | 'code' = display === 'code' || display === false ? 'code' : 'symbol';
    const hideCurrencyToken = display === '';
    let currencyToken = '';
    if (currencyCode && !hideCurrencyToken) {
      const currencyFormatter = new Intl.NumberFormat(locale || 'en-US', {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: currencyDisplayStyle, // 'symbol-narrow' treated as 'symbol'
      });
      const tokenParts = currencyFormatter.formatToParts(1);
      const currencyPart = tokenParts.find((p) => p.type === 'currency');
      currencyToken = currencyPart?.value || currencyCode;
    }

    const needsSpace = currencyDisplayStyle === 'code';
    const pattern = placement === 'after' ? (needsSpace ? '# !' : '#!') : needsSpace ? '! #' : '!#';

    return currency(numericValue, {
      symbol: currencyToken,
      separator: thousandSeparator,
      decimal: decimalSeparator,
      pattern,
      precision,
    }).format();
  }
}
