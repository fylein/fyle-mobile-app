import deepFreeze from 'deep-freeze-strict';

import { Option } from '../models/option.model';

export const optionData1: Option[] = deepFreeze([
  {
    label: 'report 1',
    value: {
      amount: 1348.09332,
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
      is_policy_flagged: false,
      is_verified: false,
      last_approved_at: null,
      last_paid_at: null,
      last_resubmitted_at: null,
      last_submitted_at: null,
      next_approver_user_ids: null,
      num_expenses: 0,
      org_id: 'orNVthTo2Zyo',
      purpose: 'report 1',
      seq_num: 'C/2023/07/R/17',
      settlement_id: null,
      source: 'WEBAPP',
      state: 'DRAFT',
      state_display_name: 'Draft',
      tax: 1277.14,
      updated_at: new Date('2023-08-09T13:02:35.097839+00:00'),
      user: {
        email: 'ajain@fyle.in',
        full_name: 'Abhishek Jain',
        id: 'usvKA4X8Ugcr',
      },
      user_id: 'usvKA4X8Ugcr',
    },
    selected: true,
  },
  {
    label: 'report 2',
    value: {
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
      purpose: 'report 2',
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
  },
]);
