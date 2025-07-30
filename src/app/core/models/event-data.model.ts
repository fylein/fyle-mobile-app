import { Currency } from './currency.model';

export interface EventData {
  key: 'instaFyle' | 'defaultCurrency' | 'formAutofill' | 'darkMode';
  isEnabled: boolean;
  selectedCurrency?: Currency;
  selectedOption?: string;
}
