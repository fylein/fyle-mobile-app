import { Currency } from 'src/app/core/models/currency.model';

export type EventData = {
  key: 'instaFyle' | 'defaultCurrency' | 'formAutofill';
  isEnabled: boolean;
  selectedCurrency?: Currency;
};
