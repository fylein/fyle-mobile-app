import { EtxnParams } from '../models/etxn-params.model';

export const etxnParamsData1: EtxnParams = {
  tx_org_user_id: 'eq.out3t2X258rd',
  tx_state: 'in.(COMPLETE)',
  or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
  tx_report_id: 'is.null',
};
