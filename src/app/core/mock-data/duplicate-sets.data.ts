import deepFreeze from 'deep-freeze-strict';

import { DuplicateSet } from '../models/v2/duplicate-sets.model';

export const duplicateSetData1: DuplicateSet = deepFreeze({
  fields: ['field1', 'field2'],
  transaction_ids: ['tx5fBcPBAxLv'],
});

export const duplicateSetData2: DuplicateSet = deepFreeze({
  fields: ['field1', 'field2'],
  transaction_ids: ['tx5fBcPBAxLv', 'tx3nHShG60zq'],
});

export const duplicateSetData3: DuplicateSet = deepFreeze({
  fields: ['field1', 'field2'],
  transaction_ids: ['txcSFe6efB6R', 'txDDLtRaflUW'],
});

export const duplicateSetData4: DuplicateSet = deepFreeze({
  transaction_ids: ['tx5fBcPBAxLv'],
});

export const duplicateSetData5: DuplicateSet = deepFreeze({
  fields: ['field1', 'field2'],
  transaction_ids: ['txal5xGjbZ1R'],
});

export const duplicateSetData6: DuplicateSet = deepFreeze({
  transaction_ids: ['txal5xGjbZ1R'],
});
