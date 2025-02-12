import deepFreeze from 'deep-freeze-strict';

import { CardNetworkType } from '../enums/card-network-type';
import { CardEnrolledProperties } from '../models/card-enrolled-properties.model';
import { CardEnrollmentErrorsProperties } from '../models/card-enrollment-errors-properties.model';
import { CardUnenrolledProperties } from '../models/card-unenrolled-properties.model';
import { EnrollingNonRTFCardProperties } from '../models/enrolling-non-rtf-card-properties.model';

export const cardEnrolledProperties1: CardEnrolledProperties = deepFreeze({
  Source: '/enterprise/manage_corporate_cards',
  'Card Network': CardNetworkType.VISA,
  'Card ID': 'bacc15bbrRGWzf',
});

export const cardEnrolledProperties2: CardEnrolledProperties = deepFreeze({
  Source: '/enterprise/manage_corporate_cards',
  'Card Network': CardNetworkType.VISA,
  'Card ID': 'bacc15bbrRGWzf',
});

export const cardUnenrolledProperties: CardUnenrolledProperties = deepFreeze({
  'Card Network': CardNetworkType.VISA,
  'Card ID': 'bacc15bbrRGWzf',
});

export const cardEnrollmentErrorsProperties1: CardEnrollmentErrorsProperties = deepFreeze({
  'Card Network': CardNetworkType.VISA,
  Source: '/enterprise/manage_corporate_cards',
  'Error Message': 'This card already exists in the system',
});

export const cardEnrollmentErrorsProperties2: CardEnrollmentErrorsProperties = deepFreeze({
  'Card Network': CardNetworkType.VISA,
  Source: '/enterprise/manage_corporate_cards',
  'Error Message': 'Something went wrong. Please try after some time.',
});

export const cardEnrollmentErrorsProperties3: CardEnrollmentErrorsProperties = deepFreeze({
  'Card Network': CardNetworkType.VISA,
  Source: '/enterprise/manage_corporate_cards',
  'Error Message': 'Invalid card number',
});

export const cardEnrollmentErrorsProperties4: CardEnrollmentErrorsProperties = deepFreeze({
  'Card Network': CardNetworkType.VISA,
  Source: '/enterprise/manage_corporate_cards',
  'Error Message': 'Invalid card network',
});

export const enrollingNonRTFCardProperties: EnrollingNonRTFCardProperties = deepFreeze({
  Source: '/enterprise/manage_corporate_cards',
});
