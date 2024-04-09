export interface PreferenceSetting {
  title: string;
  content: string;
  key: 'instaFyle' | 'defaultCurrency' | 'formAutofill';
  defaultCurrency?: string;
  isEnabled: boolean;
  isAllowed: boolean;
}
