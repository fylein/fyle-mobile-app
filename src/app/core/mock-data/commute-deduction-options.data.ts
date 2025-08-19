import deepFreeze from 'deep-freeze-strict';

import { CommuteDeductionOptions } from '../models/commute-deduction-options.model';

export const commuteDeductionOptionsData1: CommuteDeductionOptions[] = deepFreeze([
  {
    label: 'One way distance',
    value: 'ONE_WAY',
    distance: 100,
  },
  {
    label: 'Round trip distance',
    value: 'ROUND_TRIP',
    distance: 200,
  },
  {
    label: 'No deduction',
    value: 'NO_DEDUCTION',
    distance: 0,
  },
]);
