import { Approver } from '../models/v1/approver.model';

export const apiApproverRes: Approver[] = [
  {
    id: 43776,
    created_at: null,
    updated_at: new Date('2022-12-14T11:08:19.410Z'),
    report_id: 'rphNNUiCISkD',
    approver_id: 'ouCI4UQ2G0K1',
    request_id: null,
    state: 'APPROVAL_DONE',
    added_by: null,
    disabled_by: null,
    last_updated_by: null,
    rank: 0,
    approver_name: 'Abhishek Jain',
    approver_email: 'ajain@fyle.in',
    comment: null,
  },
  {
    id: 43775,
    created_at: null,
    updated_at: new Date('2022-12-14T11:07:56.080Z'),
    report_id: 'rphNNUiCISkD',
    approver_id: 'ouyy40tyFnrP',
    request_id: null,
    state: 'APPROVAL_DISABLED',
    added_by: null,
    disabled_by: null,
    last_updated_by: null,
    rank: 0,
    approver_name: 'chethan0',
    approver_email: 'chethan.m+0@fyle.in',
    comment: null,
  },
];

export const apiAllApproverRes1: Approver[] = [
  {
    id: 45435,
    created_at: null,
    updated_at: null,
    report_id: 'rpvwqzb9Jqq0',
    approver_id: 'out3t2X258rd',
    request_id: null,
    state: 'APPROVAL_PENDING',
    added_by: null,
    disabled_by: null,
    last_updated_by: null,
    rank: 0,
    approver_name: 'Aiyush',
    approver_email: 'aiyush.dhar@fyle.in',
    comment: null,
  },
  {
    id: 45437,
    created_at: null,
    updated_at: null,
    report_id: 'rpvcIMRMyM3A',
    approver_id: 'out3t2X258rd',
    request_id: null,
    state: 'APPROVAL_PENDING',
    added_by: null,
    disabled_by: null,
    last_updated_by: null,
    rank: 0,
    approver_name: 'Aiyush',
    approver_email: 'aiyush.dhar@fyle.in',
    comment: null,
  },
];

export const apiAllApproverRes2: Approver[] = [
  {
    id: 44024,
    created_at: null,
    updated_at: null,
    report_id: 'rpDyD26O3qpV',
    approver_id: 'ouPLa4wwryk7',
    request_id: null,
    state: 'APPROVAL_PENDING',
    added_by: null,
    disabled_by: null,
    last_updated_by: null,
    rank: 0,
    approver_name: 'Aditya Baddur',
    approver_email: 'adityabaddur+test_accounts@gmail.com',
    comment: null,
  },
  {
    id: 44201,
    created_at: null,
    updated_at: null,
    report_id: 'rpqzKD4bPXpW',
    approver_id: 'ouog7ej7Thsd',
    request_id: null,
    state: 'APPROVAL_DISABLED',
    added_by: null,
    disabled_by: null,
    last_updated_by: null,
    rank: 0,
    approver_name: 'YAsh',
    approver_email: 'yash.s@fyle.in',
    comment: null,
  },
];

export const expectedApprovers: Approver[] = [
  {
    id: 44024,
    created_at: null,
    updated_at: null,
    report_id: 'rpDyD26O3qpV',
    approver_id: 'ouPLa4wwryk7',
    request_id: null,
    state: 'APPROVAL_PENDING',
    added_by: null,
    disabled_by: null,
    last_updated_by: null,
    rank: 0,
    approver_name: 'Aditya Baddur',
    approver_email: 'adityabaddur+test_accounts@gmail.com',
    comment: null,
  },
  {
    id: 44201,
    created_at: null,
    updated_at: null,
    report_id: 'rpqzKD4bPXpW',
    approver_id: 'ouog7ej7Thsd',
    request_id: null,
    state: 'APPROVAL_DISABLED',
    added_by: null,
    disabled_by: null,
    last_updated_by: null,
    rank: 0,
    approver_name: 'YAsh',
    approver_email: 'yash.s@fyle.in',
    comment: null,
  },
];

export const addApproversParam: Approver[] = [
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
];

export const expectedAllApprovers: Approver[] = [
  {
    id: 45435,
    created_at: null,
    updated_at: null,
    report_id: 'rpvwqzb9Jqq0',
    approver_id: 'out3t2X258rd',
    request_id: null,
    state: 'APPROVAL_PENDING',
    added_by: null,
    disabled_by: null,
    last_updated_by: null,
    rank: 0,
    approver_name: 'Aiyush',
    approver_email: 'aiyush.dhar@fyle.in',
    comment: null,
  },
  {
    id: 45437,
    created_at: null,
    updated_at: null,
    report_id: 'rpvcIMRMyM3A',
    approver_id: 'out3t2X258rd',
    request_id: null,
    state: 'APPROVAL_PENDING',
    added_by: null,
    disabled_by: null,
    last_updated_by: null,
    rank: 0,
    approver_name: 'Aiyush',
    approver_email: 'aiyush.dhar@fyle.in',
    comment: null,
  },
  {
    id: 44024,
    created_at: null,
    updated_at: null,
    report_id: 'rpDyD26O3qpV',
    approver_id: 'ouPLa4wwryk7',
    request_id: null,
    state: 'APPROVAL_PENDING',
    added_by: null,
    disabled_by: null,
    last_updated_by: null,
    rank: 0,
    approver_name: 'Aditya Baddur',
    approver_email: 'adityabaddur+test_accounts@gmail.com',
    comment: null,
  },
  {
    id: 44201,
    created_at: null,
    updated_at: null,
    report_id: 'rpqzKD4bPXpW',
    approver_id: 'ouog7ej7Thsd',
    request_id: null,
    state: 'APPROVAL_DISABLED',
    added_by: null,
    disabled_by: null,
    last_updated_by: null,
    rank: 0,
    approver_name: 'YAsh',
    approver_email: 'yash.s@fyle.in',
    comment: null,
  },
];
