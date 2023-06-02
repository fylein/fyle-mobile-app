import { InfoCardData } from '../models/info-card-data.model';

export const allInfoCardsData: InfoCardData[] = [
  {
    title: 'Message Receipts',
    content: 'Message your receipts to Fyle at (302) 440-2921.',
    contentToCopy: '(302) 440-2921',
    toastMessageContent: 'Phone Number Copied Successfully',
    isHidden: false,
  },
  {
    title: 'Email Receipts',
    content: 'Forward your receipts to Fyle at receipts@fylehq.com.',
    contentToCopy: 'receipts@fylehq.com',
    toastMessageContent: 'Email Copied Successfully',
  },
];
