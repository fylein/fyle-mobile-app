import deepFreeze from 'deep-freeze-strict';
import { ParsedResponse } from '../models/parsed_response.model';

export const parsedResponseData1: ParsedResponse = deepFreeze({
  category: 'SYSTEM',
  currency: 'USD',
  amount: 100,
  date: new Date('2023-02-15T06:30:00.000Z'),
  invoice_dt: new Date('2023-02-24T12:03:57.680Z'),
  vendor_name: 'vendor',
});
