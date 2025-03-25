import deepFreeze from 'deep-freeze-strict';

import { Report, ReportState } from '../models/platform/v1/report.model';
import { ReportsQueryParams } from '../models/platform/v1/reports-query-params.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { ApprovalState } from '../models/platform/approval-state.enum';

export const mockQueryParams: ReportsQueryParams = deepFreeze({
  state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
  order: 'created_at.desc,id.desc',
});

export const mockQueryParamsForCount: ReportsQueryParams = deepFreeze({
  state: 'in.(DRAFT,APPROVER_PENDING,APPROVER_INQUIRY)',
});

export const platformReportData: Report = deepFreeze({
  amount: 0,
  comments: [],
  approvals: [
    {
      approver_user: {
        email: 'aditya.b@fyle.in',
        full_name: 'AB',
        id: 'usJzTy7lqHSI',
      },
      approver_user_id: 'usJzTy7lqHSI',
      state: ApprovalState.APPROVAL_PENDING,
      approver_order: 1,
    },
    {
      approver_user: {
        email: 'aastha.b@fyle.in',
        full_name: 'Aastha',
        id: 'usRjTPO4r69K',
      },
      approver_user_id: 'usRjTPO4r69K',
      state: ApprovalState.APPROVAL_DONE,
      approver_order: 2,
    },
  ],
  created_at: new Date('2023-07-11T16:24:01.335Z'),
  currency: 'USD',
  employee: {
    org_name: 'Staging Loaded',
    level: undefined,
    mobile: '123456098',
    ach_account: {
      added: true,
      verified: null,
    },
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    code: '101',
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
  is_policy_flagged: false,
  is_verified: false,
  last_approved_at: null,
  last_paid_at: null,
  last_resubmitted_at: null,
  last_submitted_at: null,
  next_approver_user_ids: ['us0wOWkksndvkdv'],
  num_expenses: 0,
  org_id: 'orNVthTo2Zyo',
  purpose: '#3:  Jul 2023 - Office expense',
  seq_num: 'C/2023/07/R/17',
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
      comments: [
        {
          comment: 'changed to APPROVER_PENDING by Suyash (suyash.p@fyle.in)',
          created_at: new Date('2024-05-21T11:07:01.99036+00:00'),
          creator_user: null,
          creator_user_id: 'SYSTEM',
          id: 'styBS6Mt3srX',
        },
        {
          comment: 'submitted by Suyash (suyash.p@fyle.in)',
          created_at: new Date('2024-05-21T11:07:02.102867+00:00'),
          creator_user: null,
          creator_user_id: 'SYSTEM',
          id: 'stI6NDy8La7b',
        },
        {
          comment: 'aaab',
          created_at: new Date('2024-05-22T07:32:19.199048+00:00'),
          creator_user: {
            email: 'aastha.b@fyle.in',
            full_name: 'Aastha',
            id: 'usaTtklUXVZn',
          },
          creator_user_id: 'usaTtklUXVZn',
          id: 'stVFdDpz1LAi',
        },
        {
          comment: 'aaac',
          created_at: new Date('2024-05-22T07:33:20.199048+00:00'),
          creator_user: {
            email: 'aastha.b@fyle.in',
            full_name: 'Aastha',
            id: 'usaTtklUXVZn',
          },
          creator_user_id: 'usaTtklUXVZn',
          id: 'stVFdDpz1LAd',
        },
        {
          comment: 'aaa',
          created_at: new Date('2024-05-23T07:34:21.199048+00:00'),
          creator_user: {
            email: 'aastha.b@fyle.in',
            full_name: 'Aastha',
            id: 'usaTtklUXVZn',
          },
          creator_user_id: 'usaTtklUXVZn',
          id: 'stVFdDpz1LAL',
        },
      ],
      approvals: [],
      org_name: 'Staging Loaded',
      level: null,
      mobile: '123456098',
      created_at: new Date('2023-07-11T06:19:28.260142+00:00'),
      currency: 'USD',
      employee: {
        org_name: 'Staging Loaded',
        level: null,
        mobile: '123456098',
        ach_account: {
          added: true,
          verified: null,
        },
        business_unit:
          'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
        code: '101',
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
      is_policy_flagged: false,
      is_verified: false,
      last_approved_at: null,
      last_paid_at: null,
      last_resubmitted_at: null,
      last_submitted_at: new Date('2023-02-01T13:02:35.097839+00:00'),
      next_approver_user_ids: ['us0wOWkksndvkdv'],
      num_expenses: 0,
      org_id: 'orNVthTo2Zyo',
      purpose: '#8:  Jan 2023',
      seq_num: 'C/2023/07/R/17',
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
      comments: [],
      created_at: new Date('2023-07-11T06:19:28.260142+00:00'),
      currency: 'USD',
      employee: {
        org_name: 'Staging Loaded',
        level: null,
        mobile: '123456098',
        ach_account: {
          added: true,
          verified: null,
        },
        business_unit:
          'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
        code: '101',
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
      is_policy_flagged: false,
      is_verified: false,
      last_approved_at: null,
      last_paid_at: null,
      last_resubmitted_at: null,
      last_submitted_at: null,
      next_approver_user_ids: null,
      num_expenses: 0,
      org_id: 'orNVthTo2Zyo',
      purpose: '#7:  Jan 2023',
      seq_num: 'C/2023/07/R/17',
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

export const allReportsPaginatedWithApproval: PlatformApiResponse<Report[]> = deepFreeze({
  count: 4,
  data: [
    {
      amount: 100,
      comments: [],
      approvals: [
        {
          approver_user: {
            email: 'aditya.b@fyle.in',
            full_name: 'AB',
            id: 'usJzTy7lqHSI',
          },
          approver_user_id: 'usJzTy7lqHSI',
          state: ApprovalState.APPROVAL_PENDING,
          approver_order: 1,
        },
        {
          approver_user: {
            email: 'aastha.b@fyle.in',
            full_name: 'Aastha',
            id: 'usRjTPO4r69K',
          },
          approver_user_id: 'usRjTPO4r69K',
          state: ApprovalState.APPROVAL_DONE,
          approver_order: 2,
        },
      ],
      created_at: new Date('2023-07-11T06:19:28.260142+00:00'),
      currency: 'USD',
      employee: {
        org_name: 'Staging Loaded',
        level: null,
        mobile: '123456098',
        ach_account: {
          added: true,
          verified: null,
        },
        business_unit:
          'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
        code: '101',
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
      is_policy_flagged: false,
      is_verified: false,
      last_approved_at: null,
      last_paid_at: null,
      last_resubmitted_at: null,
      last_submitted_at: null,
      next_approver_user_ids: null,
      num_expenses: 0,
      org_id: 'orNVthTo2Zyo',
      purpose: '#8:  Jan 2023',
      seq_num: 'C/2023/07/R/17',
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
      comments: [],
      approvals: [],
      created_at: new Date('2023-07-11T06:19:28.260142+00:00'),
      currency: 'USD',
      employee: {
        org_name: 'Staging Loaded',
        level: null,
        mobile: '123456098',
        ach_account: {
          added: true,
          verified: null,
        },
        business_unit:
          'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
        code: '101',
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
      is_policy_flagged: false,
      is_verified: false,
      last_approved_at: null,
      last_paid_at: null,
      last_resubmitted_at: null,
      last_submitted_at: null,
      next_approver_user_ids: null,
      num_expenses: 0,
      org_id: 'orNVthTo2Zyo',
      purpose: '#7:  Jan 2023',
      seq_num: 'C/2023/07/R/17',
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

export const filteredReportsData: PlatformApiResponse<Report[]> = deepFreeze({
  count: 4,
  data: [
    {
      amount: 200,
      comments: [],
      approvals: [],
      created_at: new Date('2023-07-11T06:19:28.260142+00:00'),
      currency: 'USD',
      employee: {
        org_name: 'Staging Loaded',
        level: null,
        mobile: '123456098',
        ach_account: {
          added: true,
          verified: null,
        },
        business_unit:
          'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
        code: '101',
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
      is_policy_flagged: false,
      is_verified: false,
      last_approved_at: null,
      last_paid_at: null,
      last_resubmitted_at: null,
      last_submitted_at: null,
      next_approver_user_ids: null,
      num_expenses: 0,
      org_id: 'orNVthTo2Zyo',
      purpose: '#7:  Jan 2023',
      seq_num: 'C/2023/07/R/17',
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
      comments: [],
      approvals: [],
      created_at: new Date('2023-07-11T06:19:28.260142+00:00'),
      currency: 'USD',
      employee: {
        org_name: 'Staging Loaded',
        level: null,
        mobile: '123456098',
        ach_account: {
          added: true,
          verified: null,
        },
        business_unit:
          'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
        code: '101',
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
      is_policy_flagged: false,
      is_verified: false,
      last_approved_at: null,
      last_paid_at: null,
      last_resubmitted_at: null,
      last_submitted_at: null,
      next_approver_user_ids: null,
      num_expenses: 0,
      org_id: 'orNVthTo2Zyo',
      purpose: '#6:  Jan 2023',
      seq_num: 'C/2023/07/R/17',
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
      comments: [],
      approvals: [],
      created_at: new Date('2023-07-11T06:19:28.260142+00:00'),
      currency: 'USD',
      employee: {
        org_name: 'Staging Loaded',
        level: null,
        mobile: '123456098',
        ach_account: {
          added: true,
          verified: null,
        },
        business_unit:
          'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
        code: '101',
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
      is_policy_flagged: false,
      is_verified: false,
      last_approved_at: null,
      last_paid_at: null,
      last_resubmitted_at: null,
      last_submitted_at: null,
      next_approver_user_ids: null,
      num_expenses: 0,
      org_id: 'orNVthTo2Zyo',
      purpose: '#4:  Jan 2023',
      seq_num: 'C/2023/07/R/17',
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
  comments: [
    {
      comment: 'changed to APPROVER_PENDING by Suyash (suyash.p@fyle.in)',
      created_at: new Date('2024-05-21T11:07:01.99036+00:00'),
      creator_user: null,
      creator_user_id: 'SYSTEM',
      id: 'styBS6Mt3srX',
    },
    {
      comment: 'submitted by Suyash (suyash.p@fyle.in)',
      created_at: new Date('2024-05-21T11:07:02.102867+00:00'),
      creator_user: null,
      creator_user_id: 'SYSTEM',
      id: 'stI6NDy8La7b',
    },
    {
      comment: 'aaab',
      created_at: new Date('2024-05-22T07:32:19.199048+00:00'),
      creator_user: {
        email: 'aastha.b@fyle.in',
        full_name: 'Aastha',
        id: 'usaTtklUXVZn',
      },
      creator_user_id: 'usaTtklUXVZn',
      id: 'stVFdDpz1LAi',
    },
    {
      comment: 'aaac',
      created_at: new Date('2024-05-22T07:33:20.199048+00:00'),
      creator_user: {
        email: 'aastha.b@fyle.in',
        full_name: 'Aastha',
        id: 'usaTtklUXVZn',
      },
      creator_user_id: 'usaTtklUXVZn',
      id: 'stVFdDpz1LAd',
    },
    {
      comment: 'aaa',
      created_at: new Date('2024-05-23T07:34:21.199048+00:00'),
      creator_user: {
        email: 'aastha.b@fyle.in',
        full_name: 'Aastha',
        id: 'usaTtklUXVZn',
      },
      creator_user_id: 'usaTtklUXVZn',
      id: 'stVFdDpz1LAL',
    },
  ],
  currency: 'USD',
  employee: {
    org_name: 'Staging Loaded',
    level: null,
    mobile: '123456098',
    ach_account: {
      added: true,
      verified: null,
    },
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    code: '101',
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
  is_policy_flagged: false,
  is_verified: false,
  last_approved_at: null,
  last_paid_at: null,
  last_resubmitted_at: null,
  last_submitted_at: null,
  next_approver_user_ids: null,
  num_expenses: 0,
  org_id: 'orNVthTo2Zyo',
  purpose: '#6:  Jan 2023',
  seq_num: 'C/2023/07/R/17',
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

export const submittedReportDataWithApproval: Report = deepFreeze({
  amount: 300,
  comments: [],
  approvals: [
    {
      approver_user: {
        email: 'aditya.b@fyle.in',
        full_name: 'AB',
        id: 'usJzTy7lqHSI',
      },
      approver_user_id: 'usJzTy7lqHSI',
      state: ApprovalState.APPROVAL_PENDING,
      approver_order: 0,
    },
    {
      approver_user: {
        email: 'aastha.b@fyle.in',
        full_name: 'Aastha',
        id: 'usRjTPO4r69K',
      },
      approver_user_id: 'usRjTPO4r69K',
      state: ApprovalState.APPROVAL_DONE,
      approver_order: 0,
    },
  ],
  created_at: new Date('2023-07-11T06:19:28.260142+00:00'),
  currency: 'USD',
  employee: {
    org_name: 'Staging Loaded',
    level: null,
    mobile: '123456098',
    ach_account: {
      added: true,
      verified: null,
    },
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    code: '101',
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
  is_policy_flagged: false,
  is_verified: false,
  last_approved_at: null,
  last_paid_at: null,
  last_resubmitted_at: null,
  last_submitted_at: null,
  next_approver_user_ids: null,
  num_expenses: 0,
  org_id: 'orNVthTo2Zyo',
  purpose: '#6:  Jan 2023',
  seq_num: 'C/2023/07/R/17',
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

export const paidReportData: Report = deepFreeze({
  ...submittedReportDataWithApproval,
  num_expenses: 1,
  state: ReportState.PAID,
});

export const expectedSingleReport: Report[] = deepFreeze([allReportsPaginated1.data[0]]);

export const expectedReportsSinglePage: Report[] = deepFreeze([...allReportsPaginated1.data]);

export const sentBackReportData: Report = deepFreeze({ ...submittedReportData, state: 'APPROVER_INQUIRY' });

export const reportWithExpenses: Report = deepFreeze({
  ...platformReportData,
  num_expenses: 3,
  amount: 100,
});

export const reportExportResponse = deepFreeze({
  config: {
    include_receipts: true,
    type: 'pdf',
  },
  created_at: '2024-07-26T07:45:20.280083+00:00',
  file_id: null,
  id: 'relLVJ1B9hv8',
  notify_emails: ['aastha.b@fyle.in'],
  org_id: 'orrb8EW1zZsy',
  query_params: 'id=in.[rp1R44UBo7ms]',
  state: 'PENDING',
  updated_at: '2024-07-26T07:45:20.280083+00:00',
  user_id: 'usRjTPO4r69K',
});

export const expectedReportsSinglePageWithApproval: Report[] = deepFreeze([...allReportsPaginatedWithApproval.data]);

export const expectedReportsSinglePageFiltered: Report[] = deepFreeze([...filteredReportsData.data]);

export const expectedReportsPaginated: Report[] = deepFreeze([
  ...allReportsPaginated1.data,
  ...allReportsPaginated2.data,
]);

export const expectedReportsSinglePageSubmitted: Report[] = deepFreeze([
  ...allReportsPaginated1.data,
  submittedReportData,
]);

export const expectedReportsSinglePageSubmittedWithApproval: Report[] = deepFreeze([
  ...allReportsPaginated1.data,
  submittedReportDataWithApproval,
]);
