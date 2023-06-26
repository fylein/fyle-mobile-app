import { ParsedReceipt } from '../models/parsed_receipt.model';

export const parsedReceiptData1: ParsedReceipt = {
  data: {
    category: 'SYSTEM',
    currency: 'USD',
    amount: 100,
    date: new Date('2023-02-15T06:30:00.000Z'),
    invoice_dt: new Date('2023-02-24T12:03:57.680Z'),
    vendor_name: 'vendor',
  },
};

export const instaFyleData1 = {
  thumbnail: 'data-url',
  type: 'image',
  url: 'data-url',
  parsedResponse: {
    category: 'SYSTEM',
    currency: 'USD',
    amount: 100,
    date: new Date('2023-02-15T06:30:00.000Z'),
    invoice_dt: new Date('2023-02-24T12:03:57.680Z'),
    vendor_name: 'vendor',
  },
  exchangeRate: 82,
};

export const extractedData = {
  data: {
    category: 'SYSTEM',
    currency: 'USD',
    amount: 100,
    date: new Date('2023-02-15T06:30:00.000Z'),
    invoice_dt: new Date('2023-02-24T12:03:57.680Z'),
    vendor_name: 'vendor',
  },
  exchangeRate: 82,
};

export const instaFyleData2 = {
  thumbnail: 'data-url',
  type: 'image',
  url: 'data-url',
  parsedResponse: {
    category: 'SYSTEM',
    currency: 'USD',
    amount: 100,
    date: new Date('2023-02-15T06:30:00.000Z'),
    invoice_dt: new Date('2023-02-24T12:03:57.680Z'),
    vendor_name: 'vendor',
  },
};
