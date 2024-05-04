import deepFreeze from 'deep-freeze-strict';

import { DataFeedSource } from '../enums/data-feed-source.enum';

export const bankFeedSourcesData: DataFeedSource[] = deepFreeze([
  DataFeedSource.BANK_FEED_AMEX,
  DataFeedSource.BANK_FEED_CDF,
  DataFeedSource.BANK_FEED_VCF,
  DataFeedSource.BANK_FEED_S3DF,
  DataFeedSource.BANK_FEED_HAPPAY,
]);
