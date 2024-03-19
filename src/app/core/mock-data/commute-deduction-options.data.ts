import { CommuteDeductionOptions } from '../models/commute-deduction-options.model';

export const commuteDeductionOptionsData1: CommuteDeductionOptions[] = [
  {
    label: 'One Way Distance',
    value: 'ONE_WAY',
    distance: 100,
  },
  {
    label: 'Round Trip Distance',
    value: 'ROUND_TRIP',
    distance: 200,
  },
  {
    label: 'No Deduction',
    value: 'NO_DEDUCTION',
    distance: 0,
  },
];
