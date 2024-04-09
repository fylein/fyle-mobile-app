import { ErrorType } from 'src/app/fyle/my-profile/verify-number-popover/error-type.model';

type ErrorMapping = {
  type: ErrorType;
  error: string;
  value?: number;
};

export const errorMappings: ErrorMapping[] = [
  {
    type: 'LIMIT_REACHED',
    error: 'You have exhausted the limit to request OTP for your mobile number. Please try again after 24 hours.',
  },
  {
    type: 'INVALID_MOBILE_NUMBER',
    error: 'Invalid mobile number. Please try again',
  },
  {
    type: 'INVALID_OTP',
    error: 'Incorrect mobile number or OTP. Please try again.',
  },
  {
    type: 'INVALID_INPUT',
    error: 'Please enter 6 digit OTP',
  },
  {
    type: 'ATTEMPTS_LEFT',
    value: 4,
    error: 'You have 4 attempts left to verify your mobile number.',
  },
  {
    type: 'ATTEMPTS_LEFT',
    value: 1,
    error: 'You have 1 attempt left to verify your mobile number.',
  },
];
