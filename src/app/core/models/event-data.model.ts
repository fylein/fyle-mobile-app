import { Currency } from './currency.model';

export interface EventData {
  key: 'instaFyle' | 'defaultCurrency' | 'formAutofill';
  isEnabled: boolean;
  selectedCurrency?: Currency;
}
