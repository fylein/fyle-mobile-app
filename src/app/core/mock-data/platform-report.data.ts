import deepFreeze from 'deep-freeze-strict';

import { Report } from '../models/platform/v1/report.model';
import { ReportsQueryParams } from '../models/platform/v1/reports-query-params.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

export const mockQueryParams: ReportsQueryParams = deepFreeze({
  state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
  order: 'created_at.desc,id.desc',
});

export const mockQueryParamsForCount: ReportsQueryParams = deepFreeze({
  state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
});

export const platformReportData: Report = deepFreeze({
  amount: 0,
  approvals: [],
  created_at: new Date('2023-07-11T06:19:28.260142+00:00'),
  currency: 'USD',
  employee: {
    ach_account: {
      added: true,
      verified: null,
    },
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    code: null,
    department: {
      code: null,
      display_name: '0000000 / arun',
      id: 'dept7HJ9C4wvtX',
      name: '0000000',
      sub_department: 'arun',
    },
    department_id: 'dept7HJ9C4wvtX',
    id: 'ouX8dwsbLCLv',
    location: 'Mumbai',
    org_id: 'orNVthTo2Zyo',
    title: 'director',
    user: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
      id: 'usvKA4X8Ugcr',
    },
    user_id: 'usvKA4X8Ugcr',
  },
  employee_id: 'ouX8dwsbLCLv',
  id: 'rpMvN0P10l6F',
  is_exported: false,
  is_manually_flagged: false,
  is_physical_bill_submitted: false,
  is_policy_flagged: false,
  is_verified: false,
  last_approved_at: null,
  last_paid_at: null,
  last_resubmitted_at: null,
  last_submitted_at: null,
  next_approver_user_ids: null,
  num_expenses: 0,
  org_id: 'orNVthTo2Zyo',
  physical_bill_submitted_at: null,
  purpose: '#3:  Jul 2023 - Office expense',
  seq_num: 'C/2023/07/R/17',
  settlement_id: null,
  source: 'WEBAPP',
  state: 'DRAFT',
  state_display_name: 'Draft',
  tax: null,
  updated_at: new Date('2023-08-09T13:02:35.097839+00:00'),
  user: {
    email: 'ajain@fyle.in',
    full_name: 'Abhishek Jain',
    id: 'usvKA4X8Ugcr',
  },
  user_id: 'usvKA4X8Ugcr',
});

export const platformReportCountData: PlatformApiResponse<Report[]> = deepFreeze({
  count: 4,
  data: [platformReportData],
  offset: 0,
});

export const allReportsPaginated1: PlatformApiResponse<Report[]> = deepFreeze({
  count: 4,
  data: [
    {
      amount: 100,
      approvals: [],
      created_at: new Date('2023-07-11T06:19:28.260142+00:00'),
      currency: 'USD',
      employee: {
        ach_account: {
          added: true,
          verified: null,
        },
        business_unit:
          'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
        code: null,
        department: {
          code: null,
          display_name: '0000000 / arun',
          id: 'dept7HJ9C4wvtX',
          name: '0000000',
          sub_department: 'arun',
        },
        department_id: 'dept7HJ9C4wvtX',
        id: 'ouX8dwsbLCLv',
        location: 'Mumbai',
        org_id: 'orNVthTo2Zyo',
        title: 'director',
        user: {
          email: 'ajain@fyle.in',
          full_name: 'Abhishek Jain',
          id: 'usvKA4X8Ugcr',
        },
        user_id: 'usvKA4X8Ugcr',
      },
      employee_id: 'ouX8dwsbLCLv',
      id: 'rprAfNrce73O',
      is_exported: false,
      is_manually_flagged: false,
      is_physical_bill_submitted: false,
      is_policy_flagged: false,
      is_verified: false,
      last_approved_at: null,
      last_paid_at: null,
      last_resubmitted_at: null,
      last_submitted_at: null,
      next_approver_user_ids: null,
      num_expenses: 0,
      org_id: 'orNVthTo2Zyo',
      physical_bill_submitted_at: null,
      purpose: '#8:  Jan 2023',
      seq_num: 'C/2023/07/R/17',
      settlement_id: null,
      source: 'WEBAPP',
      state: 'DRAFT',
      state_display_name: 'Draft',
      tax: null,
      updated_at: new Date('2023-08-09T13:02:35.097839+00:00'),
      user: {
        email: 'ajain@fyle.in',
        full_name: 'Abhishek Jain',
        id: 'usvKA4X8Ugcr',
      },
      user_id: 'usvKA4X8Ugcr',
    },
    {
      amount: 200,
      approvals: [],
      created_at: new Date('2023-07-11T06:19:28.260142+00:00'),
      currency: 'USD',
      employee: {
        ach_account: {
          added: true,
          verified: null,
        },
        business_unit:
          'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
        code: null,
        department: {
          code: null,
          display_name: '0000000 / arun',
          id: 'dept7HJ9C4wvtX',
          name: '0000000',
          sub_department: 'arun',
        },
        department_id: 'dept7HJ9C4wvtX',
        id: 'ouX8dwsbLCLv',
        location: 'Mumbai',
        org_id: 'orNVthTo2Zyo',
        title: 'director',
        user: {
          email: 'ajain@fyle.in',
          full_name: 'Abhishek Jain',
          id: 'usvKA4X8Ugcr',
        },
        user_id: 'usvKA4X8Ugcr',
      },
      employee_id: 'ouX8dwsbLCLv',
      id: 'rpLMyvYSXgJy',
      is_exported: false,
      is_manually_flagged: false,
      is_physical_bill_submitted: false,
      is_policy_flagged: false,
      is_verified: false,
      last_approved_at: null,
      last_paid_at: null,
      last_resubmitted_at: null,
      last_submitted_at: null,
      next_approver_user_ids: null,
      num_expenses: 0,
      org_id: 'orNVthTo2Zyo',
      physical_bill_submitted_at: null,
      purpose: '#7:  Jan 2023',
      seq_num: 'C/2023/07/R/17',
      settlement_id: null,
      source: 'WEBAPP',
      state: 'DRAFT',
      state_display_name: 'Draft',
      tax: null,
      updated_at: new Date('2023-08-09T13:02:35.097839+00:00'),
      user: {
        email: 'ajain@fyle.in',
        full_name: 'Abhishek Jain',
        id: 'usvKA4X8Ugcr',
      },
      user_id: 'usvKA4X8Ugcr',
    },
  ],
  offset: 0,
});

export const allReportsPaginated2: PlatformApiResponse<Report[]> = deepFreeze({
  count: 4,
  data: [
    {
      amount: 300,
      approvals: [],
      created_at: new Date('2023-07-11T06:19:28.260142+00:00'),
      currency: 'USD',
      employee: {
        ach_account: {
          added: true,
          verified: null,
        },
        business_unit:
          'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
        code: null,
        department: {
          code: null,
          display_name: '0000000 / arun',
          id: 'dept7HJ9C4wvtX',
          name: '0000000',
          sub_department: 'arun',
        },
        department_id: 'dept7HJ9C4wvtX',
        id: 'ouX8dwsbLCLv',
        location: 'Mumbai',
        org_id: 'orNVthTo2Zyo',
        title: 'director',
        user: {
          email: 'ajain@fyle.in',
          full_name: 'Abhishek Jain',
          id: 'usvKA4X8Ugcr',
        },
        user_id: 'usvKA4X8Ugcr',
      },
      employee_id: 'ouX8dwsbLCLv',
      id: 'rpMvN0P10l6F',
      is_exported: false,
      is_manually_flagged: false,
      is_physical_bill_submitted: false,
      is_policy_flagged: false,
      is_verified: false,
      last_approved_at: null,
      last_paid_at: null,
      last_resubmitted_at: null,
      last_submitted_at: null,
      next_approver_user_ids: null,
      num_expenses: 0,
      org_id: 'orNVthTo2Zyo',
      physical_bill_submitted_at: null,
      purpose: '#6:  Jan 2023',
      seq_num: 'C/2023/07/R/17',
      settlement_id: null,
      source: 'WEBAPP',
      state: 'DRAFT',
      state_display_name: 'Draft',
      tax: null,
      updated_at: new Date('2023-08-09T13:02:35.097839+00:00'),
      user: {
        email: 'ajain@fyle.in',
        full_name: 'Abhishek Jain',
        id: 'usvKA4X8Ugcr',
      },
      user_id: 'usvKA4X8Ugcr',
    },
    {
      amount: 400,
      approvals: [],
      created_at: new Date('2023-07-11T06:19:28.260142+00:00'),
      currency: 'USD',
      employee: {
        ach_account: {
          added: true,
          verified: null,
        },
        business_unit:
          'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
        code: null,
        department: {
          code: null,
          display_name: '0000000 / arun',
          id: 'dept7HJ9C4wvtX',
          name: '0000000',
          sub_department: 'arun',
        },
        department_id: 'dept7HJ9C4wvtX',
        id: 'ouX8dwsbLCLv',
        location: 'Mumbai',
        org_id: 'orNVthTo2Zyo',
        title: 'director',
        user: {
          email: 'ajain@fyle.in',
          full_name: 'Abhishek Jain',
          id: 'usvKA4X8Ugcr',
        },
        user_id: 'usvKA4X8Ugcr',
      },
      employee_id: 'ouX8dwsbLCLv',
      id: 'rpMvN0P10l6F',
      is_exported: false,
      is_manually_flagged: false,
      is_physical_bill_submitted: false,
      is_policy_flagged: false,
      is_verified: false,
      last_approved_at: null,
      last_paid_at: null,
      last_resubmitted_at: null,
      last_submitted_at: null,
      next_approver_user_ids: null,
      num_expenses: 0,
      org_id: 'orNVthTo2Zyo',
      physical_bill_submitted_at: null,
      purpose: '#4:  Jan 2023',
      seq_num: 'C/2023/07/R/17',
      settlement_id: null,
      source: 'WEBAPP',
      state: 'DRAFT',
      state_display_name: 'Draft',
      tax: null,
      updated_at: new Date('2023-08-09T13:02:35.097839+00:00'),
      user: {
        email: 'ajain@fyle.in',
        full_name: 'Abhishek Jain',
        id: 'usvKA4X8Ugcr',
      },
      user_id: 'usvKA4X8Ugcr',
    },
  ],
  offset: 2,
});

export const submittedReportData: Report = deepFreeze({
  amount: 300,
  approvals: [],
  created_at: new Date('2023-07-11T06:19:28.260142+00:00'),
  currency: 'USD',
  employee: {
    ach_account: {
      added: true,
      verified: null,
    },
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    code: null,
    department: {
      code: null,
      display_name: '0000000 / arun',
      id: 'dept7HJ9C4wvtX',
      name: '0000000',
      sub_department: 'arun',
    },
    department_id: 'dept7HJ9C4wvtX',
    id: 'ouX8dwsbLCLv',
    location: 'Mumbai',
    org_id: 'orNVthTo2Zyo',
    title: 'director',
    user: {
      email: 'ajain@fyle.in',
      full_name: 'Abhishek Jain',
      id: 'usvKA4X8Ugcr',
    },
    user_id: 'usvKA4X8Ugcr',
  },
  employee_id: 'ouX8dwsbLCLv',
  id: 'rpMvN0P10l6F',
  is_exported: false,
  is_manually_flagged: false,
  is_physical_bill_submitted: false,
  is_policy_flagged: false,
  is_verified: false,
  last_approved_at: null,
  last_paid_at: null,
  last_resubmitted_at: null,
  last_submitted_at: null,
  next_approver_user_ids: null,
  num_expenses: 0,
  org_id: 'orNVthTo2Zyo',
  physical_bill_submitted_at: null,
  purpose: '#6:  Jan 2023',
  seq_num: 'C/2023/07/R/17',
  settlement_id: null,
  source: 'WEBAPP',
  state: 'APPROVER_PENDING',
  state_display_name: 'Draft',
  tax: null,
  updated_at: new Date('2023-08-09T13:02:35.097839+00:00'),
  user: {
    email: 'ajain@fyle.in',
    full_name: 'Abhishek Jain',
    id: 'usvKA4X8Ugcr',
  },
  user_id: 'usvKA4X8Ugcr',
});

export const expectedSingleReport: Report[] = deepFreeze([allReportsPaginated1.data[0]]);

export const expectedReportsSinglePage: Report[] = deepFreeze([...allReportsPaginated1.data]);

export const expectedReportsPaginated: Report[] = deepFreeze([
  ...allReportsPaginated1.data,
  ...allReportsPaginated2.data,
]);

export const expectedReportsSinglePageSubmitted: Report[] = deepFreeze([...allReportsPaginated1.data, submittedReportData]);
