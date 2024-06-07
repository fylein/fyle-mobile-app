import deepFreeze from 'deep-freeze-strict';

import { InfoCardData } from '../models/info-card-data.model';

export const allInfoCardsData: InfoCardData[] = deepFreeze([
  {
    title: 'Email Receipts',
    content: 'Forward your receipts to Fyle at receipts@fylehq.com.',
    contentToCopy: 'receipts@fylehq.com',
    toastMessageContent: 'Email Copied Successfully',
    isShown: true,
  },
]);
