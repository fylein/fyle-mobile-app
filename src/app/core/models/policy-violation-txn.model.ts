import { PolicyViolation } from './policy-violation.model';

export interface PolicyViolationTxn {
  [transactionID: string]: PolicyViolation;
}
