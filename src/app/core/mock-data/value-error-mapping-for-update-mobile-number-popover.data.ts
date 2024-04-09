interface ValueErrorMapping {
  value: string | null;
  error: string | null;
}

export const valueErrorMapping: ValueErrorMapping[] = [
  {
    value: null,
    error: 'Please enter a Mobile Number',
  },
  {
    value: '',
    error: 'Please enter a Mobile Number',
  },
  {
    value: '123+98',
    error: 'Please enter a valid mobile number with country code. e.g. +12025559975',
  },
  {
    value: '8080913866',
    error: 'Please enter a valid mobile number with country code. e.g. +12025559975',
  },
  {
    value: '+918080913866',
    error: null,
  },
];
