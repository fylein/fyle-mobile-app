import { PerDiemReports } from '../models/per-diem-reports.model';

export const perDiemReportsData1: PerDiemReports[] = [
  {
    label: 'eggwhite',
    value: {
      rp: {
        id: 'rp35DK02IvMP',
        org_user_id: 'ouX8dwsbLCLv',
        created_at: new Date('2022-11-16T14:37:42.982Z'),
        purpose: 'eggwhite',
        currency: 'INR',
        amount: 315.12,
        tax: 9.48,
        state: 'APPROVER_INQUIRY',
        source: 'WEBAPP',
        num_transactions: 2,
        approvals: [
          {
            id: 43239,
            created_at: null,
            updated_at: null,
            report_id: 'rp35DK02IvMP',
            approver_id: 'oul4Zj5uQge0',
            request_id: null,
            state: 'APPROVAL_PENDING',
            added_by: null,
            disabled_by: null,
            last_updated_by: null,
            rank: 99,
            approver_name: 'Ashutosh Muley',
            approver_email: 'ashutosh.m@fyle.in',
            comment: null,
          },
        ],
        settlement_id: null,
        approved_at: new Date('2022-11-17T06:02:14.161Z'),
        reimbursed_at: null,
        submitted_at: new Date('2022-11-16T14:37:43.830Z'),
        verification_state: null,
        trip_request_id: null,
        physical_bill: false,
        physical_bill_at: null,
        exported: null,
        manual_flag: false,
        policy_flag: false,
        claim_number: 'C/2022/11/R/11',
        from_dt: null,
        to_dt: null,
        location1: null,
        location2: null,
        location3: null,
        location4: null,
        location5: null,
        type: 'EXPENSE',
        locations: [],
        risk_state_expense_count: null,
        risk_state: null,
      },
      ou: {
        id: 'ouX8dwsbLCLv',
        org_id: 'orNVthTo2Zyo',
        location: 'Mumbai',
        business_unit:
          'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
        department: '0000000',
        sub_department: null,
        mobile: '+12025559975',
        title: 'director',
        employee_id: '',
        status: 'ACTIVE',
        org_name: 'Staging Loaded',
        department_id: 'deptpmQ0SsMO0S',
      },
      us: {
        full_name: 'Abhishek Jain',
        email: 'ajain@fyle.in',
      },
    },
  },
  {
    label: '#2:  Dec 2020',
    value: {
      rp: {
        id: 'rppMWBOkXJeS',
        org_user_id: 'ouX8dwsbLCLv',
        created_at: new Date('2020-12-24T10:10:01.301Z'),
        purpose: '#2:  Dec 2020',
        currency: 'INR',
        amount: 144,
        tax: 0,
        state: 'APPROVER_PENDING',
        source: 'MOBILE',
        num_transactions: 1,
        approvals: [
          {
            id: 27034,
            created_at: null,
            updated_at: null,
            report_id: 'rppMWBOkXJeS',
            approver_id: 'oufIVELfl7I6',
            request_id: null,
            state: 'APPROVAL_DISABLED',
            added_by: null,
            disabled_by: null,
            last_updated_by: null,
            rank: 99,
            approver_name: 'test_new',
            approver_email: '123@fye.in',
            comment: null,
          },
          {
            id: 35061,
            created_at: null,
            updated_at: null,
            report_id: 'rppMWBOkXJeS',
            approver_id: 'ouoAGVIKSOZm',
            request_id: null,
            state: 'APPROVAL_DISABLED',
            added_by: null,
            disabled_by: null,
            last_updated_by: null,
            rank: 0,
            approver_name: 'chethan90',
            approver_email: 'chethan.m+90@fyle.in',
            comment: null,
          },
        ],
        settlement_id: null,
        approved_at: null,
        reimbursed_at: null,
        submitted_at: new Date('2020-12-24T10:10:02.421Z'),
        verification_state: null,
        trip_request_id: null,
        physical_bill: false,
        physical_bill_at: null,
        exported: null,
        manual_flag: false,
        policy_flag: false,
        claim_number: 'C/2020/12/R/56',
        from_dt: null,
        to_dt: null,
        location1: null,
        location2: null,
        location3: null,
        location4: null,
        location5: null,
        type: 'EXPENSE',
        locations: [],
        risk_state_expense_count: null,
        risk_state: 'HIGH_RISK',
      },
      ou: {
        id: 'ouX8dwsbLCLv',
        org_id: 'orNVthTo2Zyo',
        location: 'Mumbai',
        business_unit:
          'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
        department: '0000000',
        sub_department: null,
        mobile: '+12025559975',
        title: 'director',
        employee_id: '',
        status: 'ACTIVE',
        org_name: 'Staging Loaded',
        department_id: 'deptpmQ0SsMO0S',
      },
      us: {
        full_name: 'Abhishek Jain',
        email: 'ajain@fyle.in',
      },
    },
  },
];
