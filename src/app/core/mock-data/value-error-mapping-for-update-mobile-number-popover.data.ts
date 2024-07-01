import deepFreeze from 'deep-freeze-strict';
import { ValueErrorMapping } from '../models/mobile-number-value-error-mapping.model';

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
