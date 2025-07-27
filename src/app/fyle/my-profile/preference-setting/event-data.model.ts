import { Currency } from 'src/app/core/models/currency.model';

export type EventData = {
  key: 'instaFyle' | 'defaultCurrency' | 'formAutofill' | 'darkMode';
  isEnabled: boolean;
  selectedCurrency?: Currency;
  selectedOption?: string;
};
