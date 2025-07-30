export interface PreferenceSetting {
  title: string;
  content: string;
  key: 'instaFyle' | 'defaultCurrency' | 'formAutofill' | 'darkMode';
  defaultCurrency?: string;
  isEnabled: boolean;
  isAllowed: boolean;
  options?: string[];
  selectedOption?: string;
}
