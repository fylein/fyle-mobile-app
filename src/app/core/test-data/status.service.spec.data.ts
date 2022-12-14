import { ExtendedStatus } from '../models/extended_status.model';

export const getApiResponse = [
  {
    st_id: 'st7ak7UoeTDH',
    st_created_at: '2022-09-23T15:33:52.696Z',
    st_org_user_id: 'POLICY',
    st_comment: 'food expenses are limited to rs 200 only',
    st_diff: {
      'Violating Transactions': [
        'E/2022/09/T/28 (INR 200, Food, testing 5)\n',
        'E/2022/09/T/29 (INR 0, Food, testing 5)\n',
      ],
    },
    st_state: null,
    st_transaction_id: 'tx1oTNwgRdRq',
    st_report_id: null,
    st_advance_request_id: null,
    us_full_name: 'some',
    us_email: null,
  },
  {
    st_id: 'st8dHUhDzXxr',
    st_created_at: '2022-09-21T15:33:51.727Z',
    st_org_user_id: 'POLICY',
    st_comment: 'Flagged as per policy',
    st_diff: null,
    st_state: null,
    st_transaction_id: 'tx1oTNwgRdRq',
    st_report_id: null,
    st_advance_request_id: null,
    us_full_name: 'some',
    us_email: null,
  },
  {
    st_id: 'stFl71WSazpD',
    st_created_at: '2022-09-22T15:33:51.761Z',
    st_org_user_id: 'POLICY',
    st_comment: 'food expenses are limited to rs 200 only',
    st_diff: null,
    st_state: null,
    st_transaction_id: 'tx1oTNwgRdRq',
    st_report_id: null,
    st_advance_request_id: null,
    us_full_name: 'some',
    us_email: null,
  },
  {
    st_id: 'stcA35pBcjBu',
    st_created_at: '2022-09-21T15:33:51.774Z',
    st_org_user_id: 'POLICY',
    st_comment:
      'The policy violation will trigger the following action(s): expense will be flagged for verification and approval, expense could not be added to a report or submitted',
    st_diff: null,
    st_state: null,
    st_transaction_id: 'tx1oTNwgRdRq',
    st_report_id: null,
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
  },
  {
    st_id: 'stIwoMKmTqeM',
    st_created_at: '2022-09-21T15:33:50.409Z',
    st_org_user_id: 'SYSTEM',
    st_comment: 'created by Abhishek (ajain@fyle.in)',
    st_diff: {
      'non-reimbursable': false,
      'sub-category': 'Food',
      'breakfast provided': false,
      'cost-center name': '11',
      'project name': 'testing 5',
      'text-field': '111',
      'user entered amount': 100,
      custom: 'null',
      'transaction date': 'Wednesday, September 21, 2022',
      currency: 'INR',
      category: 'Food',
    },
    st_state: null,
    st_transaction_id: 'tx1oTNwgRdRq',
    st_report_id: null,
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
  },
];

export const getEstatusApiResponse: ExtendedStatus[] = [
  {
    st_id: 'st7ak7UoeTDH',
    st_created_at: new Date('2022-09-23T15:33:52.696Z'),
    st_org_user_id: 'POLICY',
    st_comment: 'food expenses are limited to rs 200 only',
    st_diff: {
      'Violating Transactions': [
        'E/2022/09/T/28 (INR 200, Food, testing 5)\n',
        'E/2022/09/T/29 (INR 0, Food, testing 5)\n',
      ],
    },
    st_state: null,
    st_transaction_id: 'tx1oTNwgRdRq',
    st_report_id: null,
    st_advance_request_id: null,
    us_full_name: 'some',
    us_email: null,
  },
  {
    st_id: 'st8dHUhDzXxr',
    st_created_at: new Date('2022-09-21T15:33:51.727Z'),
    st_org_user_id: 'POLICY',
    st_comment: 'Flagged as per policy',
    st_diff: null,
    st_state: null,
    st_transaction_id: 'tx1oTNwgRdRq',
    st_report_id: null,
    st_advance_request_id: null,
    us_full_name: 'some',
    us_email: null,
  },
  {
    st_id: 'stFl71WSazpD',
    st_created_at: new Date('2022-09-22T15:33:51.761Z'),
    st_org_user_id: 'POLICY',
    st_comment: 'food expenses are limited to rs 200 only',
    st_diff: null,
    st_state: null,
    st_transaction_id: 'tx1oTNwgRdRq',
    st_report_id: null,
    st_advance_request_id: null,
    us_full_name: 'some',
    us_email: null,
  },
  {
    st_id: 'stcA35pBcjBu',
    st_created_at: new Date('2022-09-21T15:33:51.774Z'),
    st_org_user_id: 'POLICY',
    st_comment:
      'The policy violation will trigger the following action(s): expense will be flagged for verification and approval, expense could not be added to a report or submitted',
    st_diff: null,
    st_state: null,
    st_transaction_id: 'tx1oTNwgRdRq',
    st_report_id: null,
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
  },
  {
    st_id: 'stIwoMKmTqeM',
    st_created_at: new Date('2022-09-21T15:33:50.409Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'created by Abhishek (ajain@fyle.in)',
    st_diff: {
      'non-reimbursable': false,
      'sub-category': 'Food',
      'breakfast provided': false,
      'cost-center name': '11',
      'project name': 'testing 5',
      'text-field': '111',
      'user entered amount': 100,
      custom: 'null',
      'transaction date': 'Wednesday, September 21, 2022',
      currency: 'INR',
      category: 'Food',
    },
    st_state: null,
    st_transaction_id: 'tx1oTNwgRdRq',
    st_report_id: null,
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
  },
];

export const apiCommentsResponse: ExtendedStatus[] = [
  {
    st_id: 'stB3NqJuL3eE',
    st_created_at: new Date('2022-10-28T05:54:01.537Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'created',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'styGA9jgFCgn',
    st_created_at: new Date('2022-10-28T05:54:42.948Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'updated',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'stPMOqmnwgOy',
    st_created_at: new Date('2022-10-28T05:58:03.433Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'hotel request transportation request',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'automatically merged',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'merged 2 expenses',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'merged expenses',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'created reversal',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'policy violation will trigger the following action',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'deleted',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'removed from the report',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'added',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'flagged',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'unflagged',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'additional approvers are not present',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'verified',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'un-approved',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'approved',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'payment_processing',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'to paid',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'report',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'expense issues',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'policies ran successfully',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'auto-matched by',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'unmatched by',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'matched by',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'expense is a possible duplicate',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'duplicate expense(s) with similar details',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'some comment',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
  },
];

export const updateReponseWithFlattenedEStatus: ExtendedStatus[] = [
  {
    st_id: 'stB3NqJuL3eE',
    st_created_at: new Date('2022-10-28T05:54:01.537Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'created',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'reports Created',
      icon: 'circle',
    },
  },
  {
    st_id: 'styGA9jgFCgn',
    st_created_at: new Date('2022-10-28T05:54:42.948Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'updated',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'reports Edited',
      icon: 'edit',
    },
  },
  {
    st_id: 'stPMOqmnwgOy',
    st_created_at: new Date('2022-10-28T05:58:03.433Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'hotel request transportation request',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Others',
      icon: 'circle',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'automatically merged',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Expense automatically merged',
      icon: 'fy-merge',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'merged 2 expenses',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: '2 expenses merged to this expense',
      icon: 'fy-merge',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'merged expenses',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Expense merged',
      icon: 'fy-merge',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'created reversal',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'reports Reversed',
      icon: 'circle',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'policy violation will trigger the following action',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Policy Violation',
      icon: 'danger',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'deleted',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Receipt Removed',
      icon: 'no-attachment',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'removed from the report',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Expense removed',
      icon: 'fy-delete',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'added',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Receipt Attached',
      icon: 'attachment',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'flagged',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Flagged',
      icon: 'flag',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'unflagged',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Unflagged',
      icon: 'flag',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'additional approvers are not present',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Failed to run policies',
      icon: 'error-filled',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'verified',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Verified',
      icon: 'success-tick',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'un-approved',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'reports Sent Back',
      icon: 'send-back',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'approved',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'reports Approved',
      icon: 'success-tick',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'payment_processing',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Processing Payment',
      icon: 'fy-recently-used',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'to paid',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Paid',
      icon: 'success-tick',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'report',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Report',
      icon: 'list',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'expense issues',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Expense Issues',
      icon: 'error-filled',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'policies ran successfully',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Policies Ran Successfully',
      icon: 'success-tick',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'auto-matched by',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Card Transaction Matched',
      icon: 'card-filled',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'unmatched by',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Expense Unmatched',
      icon: 'fy-corporate-card',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'matched by',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Expense Matched',
      icon: 'card-filled',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'expense is a possible duplicate',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Duplicate Detected',
      icon: 'duplicate',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'duplicate expense(s) with similar details',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Duplicate(s) issue resolved',
      icon: 'duplicate',
    },
  },
  {
    st_id: 'st3xjYhJBfIu',
    st_created_at: new Date('2022-10-31T10:26:57.846Z'),
    st_org_user_id: 'SYSTEM',
    st_comment: 'some comment',
    st_diff: null,
    st_state: null,
    st_transaction_id: null,
    st_report_id: 'rp39MrwyOm9n',
    st_advance_request_id: null,
    us_full_name: null,
    us_email: null,
    isBotComment: true,
    isSelfComment: false,
    isOthersComment: true,
    st: {
      category: 'Others',
      icon: 'circle',
    },
  },
];
