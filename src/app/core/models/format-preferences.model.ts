export interface FormatPreferences {
  timeFormat: string;
  currencyFormat: {
    placement: 'before' | 'after';
    thousandSeparator: string;
    decimalSeparator: string;
  };
}
