import { InstaFyleResponse } from '../models/insta-fyle-data.model';
import { ParsedReceipt } from '../models/parsed_receipt.model';

export const parsedReceiptData1: ParsedReceipt = {
  data: {
    category: 'SYSTEM',
    currency: 'USD',
    amount: 100,
    date: '2023-02-15T06:30:00.000Z',
    invoice_dt: '2023-02-24T12:03:57.680Z',
    vendor_name: 'vendor',
  },
};
export const parsedReceiptData2: ParsedReceipt = {
  data: {
    category: 'SYSTEM',
    currency: 'USD',
    amount: 100,
    date: null,
    invoice_dt: '2023-02-24T12:03:57.680Z',
    vendor_name: 'vendor',
  },
};

export const expectedInstaFyleData1: InstaFyleResponse = {
  thumbnail: 'data-url',
  type: 'image',
  url: 'data-url',
  parsedResponse: {
    category: 'SYSTEM',
    currency: 'USD',
    amount: 100,
    date: '2023-02-15T06:30:00.000Z',
    invoice_dt: '2023-02-24T12:03:57.680Z',
    vendor_name: 'vendor',
  },
  exchangeRate: 82,
};

export const instaFyleData1: InstaFyleResponse = {
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

export const extractedData: ParsedReceipt = {
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

export const expectedInstaFyleData2: InstaFyleResponse = {
  thumbnail: 'data-url',
  type: 'image',
  url: 'data-url',
  parsedResponse: {
    category: 'SYSTEM',
    currency: 'USD',
    amount: 100,
    date: '2023-02-15T06:30:00.000Z',
    invoice_dt: '2023-02-24T12:03:57.680Z',
    vendor_name: 'vendor',
  },
};

export const instaFyleData2: InstaFyleResponse = {
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

export const parsedInfo1: ParsedReceipt = {
  data: {
    category: 'SYSTEM',
    currency: 'USD',
    amount: 100,
    date: '2023-02-15T06:30:00.000Z',
    invoice_dt: '2023-02-24T12:03:57.680Z',
    vendor_name: 'vendor',
  },
  exchangeRate: 82,
};

export const parsedInfo2: ParsedReceipt = {
  data: {
    category: 'SYSTEM',
    currency: 'USD',
    amount: 100,
    date: null,
    invoice_dt: '2023-02-24T12:03:57.680Z',
    vendor_name: 'vendor',
  },
  exchangeRate: 82,
};
