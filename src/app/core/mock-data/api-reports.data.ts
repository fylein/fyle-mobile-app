import { ExtendedReport } from '../models/report.model';
import { ApiV2Response } from '../models/api-v2.model';
export const apiReportRes: ApiV2Response<ExtendedReport> = {
  count: 4,
  data: [
    {
      _search_document:
        "'0':5 '2023':3 '5':1 'a':9,15,21,27 'abhishek':33 'ajain@fyle.in':35 'business':12,18,24,30 'c/2023/01/r/11':6 'director':7 'indeed':14,20,26,32 'inr':4 'jain':34 'jan':2 'long':11,17,23,29 'mumbai':8 'unit':13,19,25,31 'very':10,16,22,28",
      approved_by: null,
      ou_business_unit:
        'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
      ou_department: '0000000',
      ou_department_id: 'deptpmQ0SsMO0S',
      ou_employee_id: '',
      ou_id: 'ouX8dwsbLCLv',
      ou_level: 123,
      ou_level_id: 'lvlPtroPaClQy',
      ou_location: 'Mumbai',
      ou_mobile: '123456',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_status: '"ACTIVE"',
      ou_sub_department: null,
      ou_title: 'director',
      report_approvals: null,
      rp_amount: 0,
      rp_approval_state: null,
      rp_approved_at: null,
      rp_claim_number: 'C/2023/01/R/11',
      rp_created_at: new Date('2023-01-17T06:35:06.814556'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rpFE5X1Pqi9P',
      rp_locations: [],
      rp_manual_flag: false,
      rp_num_transactions: 0,
      rp_org_user_id: 'ouX8dwsbLCLv',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: false,
      rp_purpose: '#5:  Jan 2023',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: null,
      rp_source: 'MOBILE',
      rp_state: 'DRAFT',
      rp_submitted_at: null,
      rp_tax: null,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: null,
      rp_verified: false,
      sequential_approval_turn: false,
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
    {
      _search_document:
        "'2023':3 '4':1 '9400':5 'a':9,15,21,27 'abhishek':33 'ajain@fyle.in':35 'business':12,18,24,30 'c/2023/01/r/10':6 'director':7 'indeed':14,20,26,32 'inr':4 'jain':34 'jan':2 'long':11,17,23,29 'mumbai':8 'unit':13,19,25,31 'very':10,16,22,28",
      approved_by: ['ouX8dwsbLCLv'],
      ou_business_unit:
        'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
      ou_department: '0000000',
      ou_department_id: 'deptpmQ0SsMO0S',
      ou_employee_id: '',
      ou_id: 'ouX8dwsbLCLv',
      ou_level: 123,
      ou_level_id: 'lvlPtroPaClQy',
      ou_location: 'Mumbai',
      ou_mobile: '123456',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_status: '"ACTIVE"',
      ou_sub_department: null,
      ou_title: 'director',
      report_approvals: {
        ouX8dwsbLCLv: {
          rank: 99,
          state: 'APPROVAL_PENDING',
        },
      },
      rp_amount: 9400,
      rp_approval_state: 'APPROVAL_PENDING',
      rp_approved_at: null,
      rp_claim_number: 'C/2023/01/R/10',
      rp_created_at: new Date('2023-01-17T06:34:58.398683'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rpSGcIEwzxDd',
      rp_locations: [],
      rp_manual_flag: false,
      rp_num_transactions: 4,
      rp_org_user_id: 'ouX8dwsbLCLv',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: true,
      rp_purpose: '#4:  Jan 2023',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: null,
      rp_source: 'WEBAPP',
      rp_state: 'APPROVER_INQUIRY',
      rp_submitted_at: new Date('2023-01-17T06:34:59.523'),
      rp_tax: 1152.3,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: null,
      rp_verified: false,
      sequential_approval_turn: true,
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
    {
      _search_document:
        "'2023':3 '324':5 '4':1 'a':9,15,21,27 'abhishek':33 'ajain@fyle.in':35 'business':12,18,24,30 'c/2023/01/r/9':6 'director':7 'indeed':14,20,26,32 'inr':4 'jain':34 'jan':2 'long':11,17,23,29 'mumbai':8 'unit':13,19,25,31 'very':10,16,22,28",
      approved_by: ['ouX8dwsbLCLv'],
      ou_business_unit:
        'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
      ou_department: '0000000',
      ou_department_id: 'deptpmQ0SsMO0S',
      ou_employee_id: '',
      ou_id: 'ouX8dwsbLCLv',
      ou_level: 123,
      ou_level_id: 'lvlPtroPaClQy',
      ou_location: 'Mumbai',
      ou_mobile: '123456',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_status: '"ACTIVE"',
      ou_sub_department: null,
      ou_title: 'director',
      report_approvals: {
        ouX8dwsbLCLv: {
          rank: 99,
          state: 'APPROVAL_DONE',
        },
      },
      rp_amount: 324,
      rp_approval_state: 'APPROVAL_DONE',
      rp_approved_at: new Date('2023-01-17T06:33:29.049'),
      rp_claim_number: 'C/2023/01/R/9',
      rp_created_at: new Date('2023-01-13T07:29:00.963045'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rpGpzBpAxtSn',
      rp_locations: [],
      rp_manual_flag: false,
      rp_num_transactions: 1,
      rp_org_user_id: 'ouX8dwsbLCLv',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: false,
      rp_purpose: '#4:  Jan 2023',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: null,
      rp_source: 'WORKFLOWS',
      rp_state: 'APPROVED',
      rp_submitted_at: new Date('2023-01-13T07:29:01.135'),
      rp_tax: 49.42,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: null,
      rp_verified: false,
      sequential_approval_turn: false,
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
    {
      _search_document:
        "'10121.24':5 '2022':3 '24':1 'a':9,15,21,27 'abhishek':33 'ajain@fyle.in':35 'business':12,18,24,30 'c/2022/12/r/34':6 'dec':2 'director':7 'indeed':14,20,26,32 'inr':4 'jain':34 'long':11,17,23,29 'mumbai':8 'unit':13,19,25,31 'very':10,16,22,28",
      approved_by: ['ouX8dwsbLCLv'],
      ou_business_unit:
        'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
      ou_department: '0000000',
      ou_department_id: 'deptpmQ0SsMO0S',
      ou_employee_id: '',
      ou_id: 'ouX8dwsbLCLv',
      ou_level: 123,
      ou_level_id: 'lvlPtroPaClQy',
      ou_location: 'Mumbai',
      ou_mobile: '123456',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_status: '"ACTIVE"',
      ou_sub_department: null,
      ou_title: 'director',
      report_approvals: {
        ouX8dwsbLCLv: {
          rank: 99,
          state: 'APPROVAL_PENDING',
        },
      },
      rp_amount: 10121.24,
      rp_approval_state: 'APPROVAL_PENDING',
      rp_approved_at: null,
      rp_claim_number: 'C/2022/12/R/34',
      rp_created_at: new Date('2022-12-26T07:29:00.734031'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rpFkJ6jUJOyg',
      rp_locations: [],
      rp_manual_flag: true,
      rp_num_transactions: 3,
      rp_org_user_id: 'ouX8dwsbLCLv',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: false,
      rp_purpose: '#24:  Dec 2022',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: null,
      rp_source: 'WORKFLOWS',
      rp_state: 'APPROVER_PENDING',
      rp_submitted_at: new Date('2022-12-26T07:29:01.743'),
      rp_tax: 305.08,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: null,
      rp_verified: false,
      sequential_approval_turn: true,
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
  ],
  limit: 4,
  offset: 0,
  url: '/v2/reports',
};

export const apiReportSingleRes: ApiV2Response<ExtendedReport> = {
  count: 1,
  data: [
    {
      _search_document:
        "'145':5 'a':8 'abhishek':10 'ajain@fyle.in':12 'bangalore':9 'c/2023/01/r/31':6 'columns':3 'inr':4 'jain':11 'lion':7 'manage':2 'test':1",
      approved_by: ['out3t2X258rd'],
      ou_business_unit: null,
      ou_department: 'Primary Sales',
      ou_department_id: 'deptSdAUA5Urej',
      ou_employee_id: 'A',
      ou_id: 'ouCI4UQ2G0K1',
      ou_level: 123,
      ou_level_id: 'lvlEtPwKjAF6U',
      ou_location: 'bangalore',
      ou_mobile: null,
      ou_org_id: 'orrjqbDbeP9p',
      ou_org_name: 'Fyle Staging',
      ou_status: '"ACTIVE"',
      ou_sub_department: 'Primary Sales',
      ou_title: 'lion',
      report_approvals: {
        out3t2X258rd: {
          rank: 0,
          state: 'APPROVAL_PENDING',
        },
      },
      rp_amount: 145,
      rp_approval_state: null,
      rp_approved_at: null,
      rp_claim_number: 'C/2023/01/R/31',
      rp_created_at: new Date('2023-01-19T07:27:33.235573'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rpfClhA1lglE',
      rp_locations: [],
      rp_manual_flag: false,
      rp_num_transactions: 3,
      rp_org_user_id: 'ouCI4UQ2G0K1',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: false,
      rp_purpose: 'test_manage_columns',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: null,
      rp_source: 'WEBAPP',
      rp_state: 'APPROVER_PENDING',
      rp_submitted_at: new Date('2023-01-19T07:27:36.879'),
      rp_tax: 15.54,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: null,
      rp_verified: false,
      sequential_approval_turn: false,
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
  ],
  limit: 1,
  offset: 0,
  url: '/v2/reports',
};

export const expectedReports: ApiV2Response<ExtendedReport> = {
  count: 4,
  data: [
    {
      _search_document:
        "'0':5 '2023':3 '5':1 'a':9,15,21,27 'abhishek':33 'ajain@fyle.in':35 'business':12,18,24,30 'c/2023/01/r/11':6 'director':7 'indeed':14,20,26,32 'inr':4 'jain':34 'jan':2 'long':11,17,23,29 'mumbai':8 'unit':13,19,25,31 'very':10,16,22,28",
      approved_by: null,
      ou_business_unit:
        'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
      ou_department: '0000000',
      ou_department_id: 'deptpmQ0SsMO0S',
      ou_employee_id: '',
      ou_id: 'ouX8dwsbLCLv',
      ou_level: 123,
      ou_level_id: 'lvlPtroPaClQy',
      ou_location: 'Mumbai',
      ou_mobile: '123456',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_status: '"ACTIVE"',
      ou_sub_department: null,
      ou_title: 'director',
      report_approvals: null,
      rp_amount: 0,
      rp_approval_state: null,
      rp_approved_at: null,
      rp_claim_number: 'C/2023/01/R/11',
      rp_created_at: new Date('2023-01-17T06:35:06.814556'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rpFE5X1Pqi9P',
      rp_locations: [],
      rp_manual_flag: false,
      rp_num_transactions: 0,
      rp_org_user_id: 'ouX8dwsbLCLv',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: false,
      rp_purpose: '#5:  Jan 2023',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: null,
      rp_source: 'MOBILE',
      rp_state: 'DRAFT',
      rp_submitted_at: null,
      rp_tax: null,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: null,
      rp_verified: false,
      sequential_approval_turn: false,
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
    {
      _search_document:
        "'2023':3 '4':1 '9400':5 'a':9,15,21,27 'abhishek':33 'ajain@fyle.in':35 'business':12,18,24,30 'c/2023/01/r/10':6 'director':7 'indeed':14,20,26,32 'inr':4 'jain':34 'jan':2 'long':11,17,23,29 'mumbai':8 'unit':13,19,25,31 'very':10,16,22,28",
      approved_by: ['ouX8dwsbLCLv'],
      ou_business_unit:
        'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
      ou_department: '0000000',
      ou_department_id: 'deptpmQ0SsMO0S',
      ou_employee_id: '',
      ou_id: 'ouX8dwsbLCLv',
      ou_level: 123,
      ou_level_id: 'lvlPtroPaClQy',
      ou_location: 'Mumbai',
      ou_mobile: '123456',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_status: '"ACTIVE"',
      ou_sub_department: null,
      ou_title: 'director',
      report_approvals: {
        ouX8dwsbLCLv: {
          rank: 99,
          state: 'APPROVAL_PENDING',
        },
      },
      rp_amount: 9400,
      rp_approval_state: 'APPROVAL_PENDING',
      rp_approved_at: null,
      rp_claim_number: 'C/2023/01/R/10',
      rp_created_at: new Date('2023-01-17T06:34:58.398683'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rpSGcIEwzxDd',
      rp_locations: [],
      rp_manual_flag: false,
      rp_num_transactions: 4,
      rp_org_user_id: 'ouX8dwsbLCLv',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: true,
      rp_purpose: '#4:  Jan 2023',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: null,
      rp_source: 'WEBAPP',
      rp_state: 'APPROVER_INQUIRY',
      rp_submitted_at: new Date('2023-01-17T06:34:59.523'),
      rp_tax: 1152.3,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: null,
      rp_verified: false,
      sequential_approval_turn: true,
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
    {
      _search_document:
        "'2023':3 '324':5 '4':1 'a':9,15,21,27 'abhishek':33 'ajain@fyle.in':35 'business':12,18,24,30 'c/2023/01/r/9':6 'director':7 'indeed':14,20,26,32 'inr':4 'jain':34 'jan':2 'long':11,17,23,29 'mumbai':8 'unit':13,19,25,31 'very':10,16,22,28",
      approved_by: ['ouX8dwsbLCLv'],
      ou_business_unit:
        'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
      ou_department: '0000000',
      ou_department_id: 'deptpmQ0SsMO0S',
      ou_employee_id: '',
      ou_id: 'ouX8dwsbLCLv',
      ou_level: 123,
      ou_level_id: 'lvlPtroPaClQy',
      ou_location: 'Mumbai',
      ou_mobile: '123456',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_status: '"ACTIVE"',
      ou_sub_department: null,
      ou_title: 'director',
      report_approvals: {
        ouX8dwsbLCLv: {
          rank: 99,
          state: 'APPROVAL_DONE',
        },
      },
      rp_amount: 324,
      rp_approval_state: 'APPROVAL_DONE',
      rp_approved_at: new Date('2023-01-17T06:33:29.049'),
      rp_claim_number: 'C/2023/01/R/9',
      rp_created_at: new Date('2023-01-13T07:29:00.963045'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rpGpzBpAxtSn',
      rp_locations: [],
      rp_manual_flag: false,
      rp_num_transactions: 1,
      rp_org_user_id: 'ouX8dwsbLCLv',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: false,
      rp_purpose: '#4:  Jan 2023',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: null,
      rp_source: 'WORKFLOWS',
      rp_state: 'APPROVED',
      rp_submitted_at: new Date('2023-01-13T07:29:01.135'),
      rp_tax: 49.42,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: null,
      rp_verified: false,
      sequential_approval_turn: false,
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
    {
      _search_document:
        "'10121.24':5 '2022':3 '24':1 'a':9,15,21,27 'abhishek':33 'ajain@fyle.in':35 'business':12,18,24,30 'c/2022/12/r/34':6 'dec':2 'director':7 'indeed':14,20,26,32 'inr':4 'jain':34 'long':11,17,23,29 'mumbai':8 'unit':13,19,25,31 'very':10,16,22,28",
      approved_by: ['ouX8dwsbLCLv'],
      ou_business_unit:
        'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
      ou_department: '0000000',
      ou_department_id: 'deptpmQ0SsMO0S',
      ou_employee_id: '',
      ou_id: 'ouX8dwsbLCLv',
      ou_level: 123,
      ou_level_id: 'lvlPtroPaClQy',
      ou_location: 'Mumbai',
      ou_mobile: '123456',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_status: '"ACTIVE"',
      ou_sub_department: null,
      ou_title: 'director',
      report_approvals: {
        ouX8dwsbLCLv: {
          rank: 99,
          state: 'APPROVAL_PENDING',
        },
      },
      rp_amount: 10121.24,
      rp_approval_state: 'APPROVAL_PENDING',
      rp_approved_at: null,
      rp_claim_number: 'C/2022/12/R/34',
      rp_created_at: new Date('2022-12-26T07:29:00.734031'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rpFkJ6jUJOyg',
      rp_locations: [],
      rp_manual_flag: true,
      rp_num_transactions: 3,
      rp_org_user_id: 'ouX8dwsbLCLv',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: false,
      rp_purpose: '#24:  Dec 2022',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: null,
      rp_source: 'WORKFLOWS',
      rp_state: 'APPROVER_PENDING',
      rp_submitted_at: new Date('2022-12-26T07:29:01.743'),
      rp_tax: 305.08,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: null,
      rp_verified: false,
      sequential_approval_turn: true,
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
  ],
  limit: 4,
  offset: 0,
  url: '/v2/reports',
};

export const apiAllReportsRes1: ApiV2Response<ExtendedReport> = {
  count: 2,
  data: [
    {
      _search_document:
        "'0':5 '2023':3 '4':1 'a':8 'abhishek':10 'ajain@fyle.in':12 'bangalore':9 'c/2023/02/r/5':6 'feb':2 'inr':4 'jain':11 'lion':7",
      approved_by: null,
      ou_business_unit: null,
      ou_department: 'Primary Sales',
      ou_department_id: 'deptSdAUA5Urej',
      ou_employee_id: 'A',
      ou_id: 'ouCI4UQ2G0K1',
      ou_level: 123,
      ou_level_id: 'lvlEtPwKjAF6U',
      ou_location: 'bangalore',
      ou_mobile: null,
      ou_org_id: 'orrjqbDbeP9p',
      ou_org_name: 'Fyle Staging',
      ou_status: '"ACTIVE"',
      ou_sub_department: 'Primary Sales',
      ou_title: 'lion',
      report_approvals: null,
      rp_amount: 0,
      rp_approval_state: null,
      rp_approved_at: null,
      rp_claim_number: 'C/2023/02/R/5',
      rp_created_at: new Date('2023-02-01T00:23:42.505Z'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rpkkdCNBFsJ2',
      rp_locations: [],
      rp_manual_flag: false,
      rp_num_transactions: 0,
      rp_org_user_id: 'ouCI4UQ2G0K1',
      rp_physical_bill: true,
      rp_physical_bill_at: new Date('2023-02-01T00:23:45.938Z'),
      rp_policy_flag: false,
      rp_purpose: '#4:  Feb 2023',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: null,
      rp_source: 'MOBILE',
      rp_state: 'APPROVER_PENDING',
      rp_submitted_at: new Date('2023-02-01T00:23:46.556Z'),
      rp_tax: 0,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: null,
      rp_verified: false,
      sequential_approval_turn: false,
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
    {
      _search_document:
        "'16370.8':5 '2023':3 '4':1 'a':8 'abhishek':10 'ajain@fyle.in':12 'bangalore':9 'c/2023/02/r/4':6 'feb':2 'inr':4 'jain':11 'lion':7",
      approved_by: null,
      ou_business_unit: null,
      ou_department: 'Primary Sales',
      ou_department_id: 'deptSdAUA5Urej',
      ou_employee_id: 'A',
      ou_id: 'ouCI4UQ2G0K1',
      ou_level: 123,
      ou_level_id: 'lvlEtPwKjAF6U',
      ou_location: 'bangalore',
      ou_mobile: null,
      ou_org_id: 'orrjqbDbeP9p',
      ou_org_name: 'Fyle Staging',
      ou_status: '"ACTIVE"',
      ou_sub_department: 'Primary Sales',
      ou_title: 'lion',
      report_approvals: null,
      rp_amount: 16370.8,
      rp_approval_state: null,
      rp_approved_at: null,
      rp_claim_number: 'C/2023/02/R/4',
      rp_created_at: new Date('2023-02-01T00:23:42.495Z'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rpNiAxUFhUlo',
      rp_locations: [],
      rp_manual_flag: false,
      rp_num_transactions: 1,
      rp_org_user_id: 'ouCI4UQ2G0K1',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: false,
      rp_purpose: '#4:  Feb 2023',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: null,
      rp_source: 'MOBILE',
      rp_state: 'DRAFT',
      rp_submitted_at: null,
      rp_tax: 15509.18,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: null,
      rp_verified: false,
      sequential_approval_turn: false,
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
  ],
  limit: 2,
  offset: 0,
  url: '/v2/reports',
};

export const apiAllReportsRes2: ApiV2Response<ExtendedReport> = {
  count: 1,
  data: [
    {
      _search_document:
        "'0':5 '2023':3 '5':1 'a':9,15,21,27 'abhishek':33 'ajain@fyle.in':35 'business':12,18,24,30 'c/2023/01/r/11':6 'director':7 'indeed':14,20,26,32 'inr':4 'jain':34 'jan':2 'long':11,17,23,29 'mumbai':8 'unit':13,19,25,31 'very':10,16,22,28",
      approved_by: null,
      ou_business_unit:
        'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
      ou_department: '0000000',
      ou_department_id: 'deptpmQ0SsMO0S',
      ou_employee_id: '',
      ou_id: 'ouX8dwsbLCLv',
      ou_level: 123,
      ou_level_id: 'lvlPtroPaClQy',
      ou_location: 'Mumbai',
      ou_mobile: '123456',
      ou_org_id: 'orNVthTo2Zyo',
      ou_org_name: 'Staging Loaded',
      ou_status: '"ACTIVE"',
      ou_sub_department: null,
      ou_title: 'director',
      report_approvals: null,
      rp_amount: 0,
      rp_approval_state: null,
      rp_approved_at: null,
      rp_claim_number: 'C/2023/01/R/11',
      rp_created_at: new Date('2023-01-17T01:05:06.814Z'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rpFE5X1Pqi9P',
      rp_locations: [],
      rp_manual_flag: false,
      rp_num_transactions: 0,
      rp_org_user_id: 'ouX8dwsbLCLv',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: false,
      rp_purpose: '#5:  Jan 2023',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: null,
      rp_source: 'MOBILE',
      rp_state: 'DRAFT',
      rp_submitted_at: null,
      rp_tax: null,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: null,
      rp_verified: false,
      sequential_approval_turn: false,
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
    },
  ],
  limit: 2,
  offset: 2,
  url: '/v2/reports',
};

export const apiTeamRptCountRes: ApiV2Response<ExtendedReport> = {
  count: 25,
  data: [
    {
      _search_document:
        "'8000':5 'aniruddha':7,9 'aniruddha.s@fyle.in':10 'c/2022/12/r/5':6 'dec':2 'inr':4 'kalyan':8 'new':1 'test':3",
      approved_by: ['ouCI4UQ2G0K1'],
      ou_business_unit: null,
      ou_department: 'AniruddhaDept',
      ou_department_id: 'deptJ2gTm72zsW',
      ou_employee_id: null,
      ou_id: 'ouWizR8UqaV9',
      ou_level: 123,
      ou_level_id: 'lvlBmu2wZ6oiC',
      ou_location: 'Kalyan',
      ou_mobile: '',
      ou_org_id: 'orrjqbDbeP9p',
      ou_org_name: 'Fyle Staging',
      ou_status: '"ACTIVE"',
      ou_sub_department: null,
      ou_title: 'aniruddha',
      report_approvals: {
        ouCI4UQ2G0K1: {
          rank: 0,
          state: 'APPROVAL_DONE',
        },
        ouyy40tyFnrP: {
          rank: 0,
          state: 'APPROVAL_DISABLED',
        },
      },
      rp_amount: 8000,
      rp_approval_state: 'APPROVAL_DONE',
      rp_approved_at: new Date('2022-12-14T11:08:19.326'),
      rp_claim_number: 'C/2022/12/R/5',
      rp_created_at: new Date('2022-12-14T11:07:55.171487'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rphNNUiCISkD',
      rp_locations: [],
      rp_manual_flag: false,
      rp_num_transactions: 1,
      rp_org_user_id: 'ouWizR8UqaV9',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: false,
      rp_purpose: 'New Dec Test',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: 'setU28WgLt5ia',
      rp_source: 'WEBAPP',
      rp_state: 'PAYMENT_PROCESSING',
      rp_submitted_at: new Date('2022-12-14T11:07:55.614'),
      rp_tax: 857.14,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: 'VERIFIED',
      rp_verified: true,
      sequential_approval_turn: false,
      us_email: 'aniruddha.s@fyle.in',
      us_full_name: 'aniruddha',
    },
  ],
  limit: 1,
  offset: 0,
  url: '/v2/reports',
};

export const apiTeamRptSingleRes: ApiV2Response<ExtendedReport> = {
  count: 1,
  data: [
    {
      _search_document:
        "'8000':5 'aniruddha':7,9 'aniruddha.s@fyle.in':10 'c/2022/12/r/5':6 'dec':2 'inr':4 'kalyan':8 'new':1 'test':3",
      approved_by: ['ouCI4UQ2G0K1'],
      ou_business_unit: null,
      ou_department: 'AniruddhaDept',
      ou_department_id: 'deptJ2gTm72zsW',
      ou_employee_id: null,
      ou_id: 'ouWizR8UqaV9',
      ou_level: 123,
      ou_level_id: 'lvlBmu2wZ6oiC',
      ou_location: 'Kalyan',
      ou_mobile: '',
      ou_org_id: 'orrjqbDbeP9p',
      ou_org_name: 'Fyle Staging',
      ou_status: '"ACTIVE"',
      ou_sub_department: null,
      ou_title: 'aniruddha',
      report_approvals: {
        ouCI4UQ2G0K1: {
          rank: 0,
          state: 'APPROVAL_DONE',
        },
        ouyy40tyFnrP: {
          rank: 0,
          state: 'APPROVAL_DISABLED',
        },
      },
      rp_amount: 8000,
      rp_approval_state: 'APPROVAL_DONE',
      rp_approved_at: new Date('2022-12-14T11:08:19.326'),
      rp_claim_number: 'C/2022/12/R/5',
      rp_created_at: new Date('2022-12-14T11:07:55.171487'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rphNNUiCISkD',
      rp_locations: [],
      rp_manual_flag: false,
      rp_num_transactions: 1,
      rp_org_user_id: 'ouWizR8UqaV9',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: false,
      rp_purpose: 'New Dec Test',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: 'setU28WgLt5ia',
      rp_source: 'WEBAPP',
      rp_state: 'PAYMENT_PROCESSING',
      rp_submitted_at: new Date('2022-12-14T11:07:55.614'),
      rp_tax: 857.14,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: 'VERIFIED',
      rp_verified: true,
      sequential_approval_turn: false,
      us_email: 'aniruddha.s@fyle.in',
      us_full_name: 'aniruddha',
    },
  ],
  limit: 1,
  offset: 0,
  url: '/v2/reports',
};

export const apiTeamReportPaginated1: ApiV2Response<ExtendedReport> = {
  count: 25,
  data: [
    {
      _search_document:
        "'8000':5 'aniruddha':7,9 'aniruddha.s@fyle.in':10 'c/2022/12/r/5':6 'dec':2 'inr':4 'kalyan':8 'new':1 'test':3",
      approved_by: ['ouCI4UQ2G0K1'],
      ou_business_unit: null,
      ou_department: 'AniruddhaDept',
      ou_department_id: 'deptJ2gTm72zsW',
      ou_employee_id: null,
      ou_id: 'ouWizR8UqaV9',
      ou_level: 123,
      ou_level_id: 'lvlBmu2wZ6oiC',
      ou_location: 'Kalyan',
      ou_mobile: '',
      ou_org_id: 'orrjqbDbeP9p',
      ou_org_name: 'Fyle Staging',
      ou_status: '"ACTIVE"',
      ou_sub_department: null,
      ou_title: 'aniruddha',
      report_approvals: {
        ouCI4UQ2G0K1: {
          rank: 0,
          state: 'APPROVAL_DONE',
        },
        ouyy40tyFnrP: {
          rank: 0,
          state: 'APPROVAL_DISABLED',
        },
      },
      rp_amount: 8000,
      rp_approval_state: 'APPROVAL_DONE',
      rp_approved_at: new Date('2022-12-14T11:08:19.326'),
      rp_claim_number: 'C/2022/12/R/5',
      rp_created_at: new Date('2022-12-14T11:07:55.171487'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rphNNUiCISkD',
      rp_locations: [],
      rp_manual_flag: false,
      rp_num_transactions: 1,
      rp_org_user_id: 'ouWizR8UqaV9',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: false,
      rp_purpose: 'New Dec Test',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: 'setU28WgLt5ia',
      rp_source: 'WEBAPP',
      rp_state: 'PAYMENT_PROCESSING',
      rp_submitted_at: new Date('2022-12-14T11:07:55.614'),
      rp_tax: 857.14,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: 'VERIFIED',
      rp_verified: true,
      sequential_approval_turn: false,
      us_email: 'aniruddha.s@fyle.in',
      us_full_name: 'aniruddha',
    },
    {
      _search_document:
        "'10000':5 '2':1 '2022':3 'aniruddha':7,9 'aniruddha.s@fyle.in':10 'c/2022/12/r/4':6 'dec':2 'inr':4 'kalyan':8",
      approved_by: ['ouCI4UQ2G0K1'],
      ou_business_unit: null,
      ou_department: 'AniruddhaDept',
      ou_department_id: 'deptJ2gTm72zsW',
      ou_employee_id: null,
      ou_id: 'ouWizR8UqaV9',
      ou_level: 123,
      ou_level_id: 'lvlBmu2wZ6oiC',
      ou_location: 'Kalyan',
      ou_mobile: '',
      ou_org_id: 'orrjqbDbeP9p',
      ou_org_name: 'Fyle Staging',
      ou_status: '"ACTIVE"',
      ou_sub_department: null,
      ou_title: 'aniruddha',
      report_approvals: {
        ouCI4UQ2G0K1: {
          rank: 0,
          state: 'APPROVAL_DONE',
        },
      },
      rp_amount: 10000,
      rp_approval_state: 'APPROVAL_DONE',
      rp_approved_at: new Date('2022-12-14T10:46:29'),
      rp_claim_number: 'C/2022/12/R/4',
      rp_created_at: new Date('2022-12-14T10:46:17.921477'),
      rp_currency: 'USD',
      rp_exported: false,
      rp_from_dt: null,
      rp_id: 'rp8Y2OcgHjWB',
      rp_locations: [],
      rp_manual_flag: false,
      rp_num_transactions: 1,
      rp_org_user_id: 'ouWizR8UqaV9',
      rp_physical_bill: false,
      rp_physical_bill_at: null,
      rp_policy_flag: false,
      rp_purpose: '#2:  Dec 2022',
      rp_reimbursed_at: null,
      rp_risk_state: null,
      rp_risk_state_expense_count: null,
      rp_settlement_id: 'setMGTXVLS0Nw',
      rp_source: 'WEBAPP',
      rp_state: 'PAYMENT_PROCESSING',
      rp_submitted_at: new Date('2022-12-14T10:46:18.336'),
      rp_tax: 9473.68,
      rp_to_dt: null,
      rp_trip_request_id: null,
      rp_type: 'EXPENSE',
      rp_verification_state: null,
      rp_verified: false,
      sequential_approval_turn: false,
      us_email: 'aniruddha.s@fyle.in',
      us_full_name: 'aniruddha',
    },
  ],
  limit: 10,
  offset: 0,
  url: '/v2/reports',
};
