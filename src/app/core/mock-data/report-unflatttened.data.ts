import { UnflattenedReport } from '../models/report-unflattened.model';

export const apiCreateDraftRes: Partial<UnflattenedReport['rp']> = {
  created_at: new Date('2023-01-19T16:25:46.804Z'),
  updated_at: new Date('2023-01-19T16:25:46.804Z'),
  last_updated_by: {
    user_id: 'usvKA4X8Ugcr',
    org_user_id: 'ouCI4UQ2G0K1',
    org_id: 'orrjqbDbeP9p',
    roles: ['APPROVER', 'ADMIN', 'FYLER', 'HOP', 'FINANCE', 'PAYMENT_PROCESSOR', 'VERIFIER', 'AUDITOR', 'OWNER'],
    scopes: [],
    allowed_CIDRs: [],
    cluster_domain: '"https://staging.fyle.tech"',
    proxy_org_user_id: null,
    tpa_id: null,
    tpa_name: null,
    name: 'ouCI4UQ2G0K1',
  },
  id: 'rp6LK3ghVatB',
  org_user_id: 'ouCI4UQ2G0K1',
  purpose: '#6:  Jan 2023',
  currency: 'INR',
  creator_id: 'ouCI4UQ2G0K1',
  amount: 0,
  tax: null,
  status_id: null,
  num_transactions: 0,
  tally_export_id: null,
  state: 'DRAFT',
  source: 'MOBILE',
  reimbursement_id: null,
  approved_at: null,
  reimbursed_at: null,
  submitted_at: null,
  settlement_id: null,
  verification_state: null,
  trip_request_id: null,
  physical_bill: false,
  exported: null,
  manual_flag: null,
  policy_flag: null,
  claim_number: 'C/2023/01/R/35',
  physical_bill_at: null,
  from_dt: null,
  to_dt: null,
  location1: null,
  location2: null,
  location3: null,
  location4: null,
  location5: null,
  type: 'EXPENSE',
};

export const apiCreateReportRes: Partial<UnflattenedReport['rp']> = {
  created_at: new Date('2023-01-21T07:45:18.869Z'),
  updated_at: new Date('2023-01-21T07:45:18.869Z'),
  last_updated_by: {
    user_id: 'usvKA4X8Ugcr',
    org_user_id: 'ouCI4UQ2G0K1',
    org_id: 'orrjqbDbeP9p',
    roles: ['APPROVER', 'ADMIN', 'FYLER', 'HOP', 'FINANCE', 'PAYMENT_PROCESSOR', 'VERIFIER', 'AUDITOR', 'OWNER'],
    scopes: [],
    allowed_CIDRs: [],
    cluster_domain: '"https://staging.fyle.tech"',
    proxy_org_user_id: null,
    tpa_id: null,
    tpa_name: null,
    name: 'ouCI4UQ2G0K1',
  },
  id: 'rp5eUkeNm9wB',
  org_user_id: 'ouCI4UQ2G0K1',
  purpose: '#7:  Jan 2023',
  currency: 'INR',
  creator_id: 'ouCI4UQ2G0K1',
  amount: 0,
  tax: null,
  status_id: null,
  num_transactions: 0,
  tally_export_id: null,
  state: 'DRAFT',
  source: 'MOBILE',
  reimbursement_id: null,
  approved_at: null,
  reimbursed_at: null,
  submitted_at: null,
  settlement_id: null,
  verification_state: null,
  trip_request_id: null,
  physical_bill: false,
  exported: null,
  manual_flag: null,
  policy_flag: null,
  claim_number: 'C/2023/01/R/42',
  physical_bill_at: null,
  from_dt: null,
  to_dt: null,
  location1: null,
  location2: null,
  location3: null,
  location4: null,
  location5: null,
  type: 'EXPENSE',
};
