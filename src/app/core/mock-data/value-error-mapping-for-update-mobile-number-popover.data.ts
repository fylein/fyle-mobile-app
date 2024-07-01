import deepFreeze from 'deep-freeze-strict';

interface ValueErrorMapping {
  value: string | null;
  error: string | null;
}

export const valueErrorMapping: ValueErrorMapping[] = deepFreeze([
  {
    value: null,
    error: 'Enter mobile number',
  },
  {
    value: '',
    error: 'Enter mobile number',
  },
  {
    value: '123+98',
    error: 'Enter mobile number with country code',
  },
  {
    value: '8080913866',
    error: 'Enter mobile number with country code',
  },
  {
    value: '+918080913866',
    error: null,
  },
]);
