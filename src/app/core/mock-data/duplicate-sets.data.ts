import { DuplicateSet } from '../models/v2/duplicate-sets.model';

export const duplicateSetData1: DuplicateSet = {
  fields: ['field1', 'field2'],
  transaction_ids: ['tx5fBcPBAxLv'],
};

export const duplicateSetData2: DuplicateSet = {
  fields: ['field1', 'field2'],
  transaction_ids: ['tx5fBcPBAxLv', 'tx3nHShG60zq'],
};

export const duplicateSetData3: DuplicateSet = {
  fields: ['field1', 'field2'],
  transaction_ids: ['txcSFe6efB6R', 'txDDLtRaflUW'],
};

export const duplicateSetData4: DuplicateSet = {
  transaction_ids: ['tx5fBcPBAxLv'],
};
