import { CardNetworkType } from '../enums/card-network-type';
import {
  CardEnrolledProperties,
  CardEnrollmentErrorsProperties,
  CardUnenrolledProperties,
  EnrollingNonRTFCardProperties,
} from '../models/tracking-properties.model';

export const cardEnrolledProperties1: CardEnrolledProperties = {
  Source: '/enterprise/manage_corporate_cards',
  'Card Network': CardNetworkType.VISA,
  'Existing Card': '',
  'Card ID': 'bacc15bbrRGWzf',
};

export const cardEnrolledProperties2: CardEnrolledProperties = {
  Source: '/enterprise/manage_corporate_cards',
  'Card Network': CardNetworkType.VISA,
  'Existing Card': '5555',
  'Card ID': 'bacc15bbrRGWzf',
};

export const cardUnenrolledProperties: CardUnenrolledProperties = {
  'Card Network': CardNetworkType.VISA,
  'Card ID': 'bacc15bbrRGWzf',
  'Card Number': '455555******5555',
};

export const cardEnrollmentErrorsProperties1: CardEnrollmentErrorsProperties = {
  'Card Network': CardNetworkType.VISA,
  Source: '/enterprise/manage_corporate_cards',
  'Existing Card': '',
  'Error Message': 'This card already exists in the system',
  'Card Number': '4555 **** **** 5555',
};

export const cardEnrollmentErrorsProperties2: CardEnrollmentErrorsProperties = {
  'Card Network': CardNetworkType.VISA,
  Source: '/enterprise/manage_corporate_cards',
  'Existing Card': '',
  'Error Message': 'Something went wrong. Please try after some time.',
  'Card Number': '4555 **** **** 5555',
};

export const cardEnrollmentErrorsProperties3: CardEnrollmentErrorsProperties = {
  'Card Network': CardNetworkType.VISA,
  Source: '/enterprise/manage_corporate_cards',
  'Existing Card': '',
  'Error Message': 'Invalid card number',
  'Card Number': '4234 **** **** 1111',
};

export const cardEnrollmentErrorsProperties4: CardEnrollmentErrorsProperties = {
  'Card Network': CardNetworkType.VISA,
  Source: '/enterprise/manage_corporate_cards',
  'Existing Card': '',
  'Error Message': 'Invalid card network',
  'Card Number': '4111 **** **** 1111',
};

export const enrollingNonRTFCardProperties: EnrollingNonRTFCardProperties = {
  'Existing Card': '',
  'Card Number': '3111 **** **** 1111',
  Source: '/enterprise/manage_corporate_cards',
};
