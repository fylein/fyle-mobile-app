export const apiTransactionCountResponse = {
  count: 1197,
  data: [
    {
      _search_document: "'57.69':1,2 'adobe':4 'cloud':6 'creative':5 'inr':3 'office':7 'shipping':8",
      amount: 57.69,
      balance_transfer_id: null,
      balance_transfer_settlement_id: null,
      bank_txn_id: 'btxnSrrehKHsAg',
      corporate_credit_card_account_number: '9301',
      created_at: '2022-07-06T10:07:22.811065',
      creator_id: null,
      currency: 'INR',
      description: 'ADOBE *CREATIVE CLOUD',
      group_amount: 57.69,
      group_id: 'ccceWauzF1A3oS',
      id: 'ccceWauzF1A3oS',
      ignored: false,
      matched_at: '2022-07-06T10:07:27.334887',
      matched_by: 'SYSTEM',
      orig_amount: null,
      orig_currency: null,
      ou_department_id: 'deptpmQ0SsMO0S',
      ou_id: 'ouX8dwsbLCLv',
      ou_org_id: 'orNVthTo2Zyo',
      payment_id: 'paySBEQRu6LyW',
      personal: false,
      reversed: false,
      settlement_id: null,
      state: 'IN_PROGRESS',
      transaction_type: 'debit',
      tx_split_group_id: 'txhLBlo6XN4k',
      txn_details: [
        {
          amount: 57.69,
          category: 'Bus',
          category_display_name: 'Bus / Travelling - Inland',
          currency: 'INR',
          expense_number: 'E/2022/07/T/48',
          id: 'txhLBlo6XN4k',
          num_files: 0,
          purpose: 'ADOBE *CREATIVE CLOUD',
          state: 'APPROVED',
          sub_category: 'Travelling - Inland',
          txn_dt: '2019-06-19T06:30:00',
          user_can_delete: true,
          vendor_id: 29200,
          vendor_name: 'Office & Shipping',
        },
      ],
      txn_dt: '2019-06-19T10:00:00',
      updated_at: '2022-07-06T10:07:27.334887',
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
      vendor: 'Office & Shipping',
    },
  ],
  limit: 1,
  offset: 0,
  url: '/v2/corporate_card_transactions',
};

export const apiSingleTransactionResponse = {
  count: 1,
  data: [
    {
      _search_document: "'19202.0':1 '19202.00':2 'inr':3 'merchant':5 'test':4",
      amount: 19202,
      balance_transfer_id: null,
      balance_transfer_settlement_id: null,
      bank_txn_id: 'btxnByM07Fbm0e',
      corporate_credit_card_account_number: 'XXXXXXXXXXXX8090',
      created_at: '2022-12-08T17:38:04.561422',
      creator_id: 'ouX8dwsbLCLv',
      currency: 'INR',
      description: null,
      group_amount: 19202,
      group_id: 'ccceRhYsN8Fj78',
      id: 'ccceRhYsN8Fj78',
      ignored: false,
      matched_at: null,
      matched_by: null,
      orig_amount: null,
      orig_currency: null,
      ou_department_id: 'deptpmQ0SsMO0S',
      ou_id: 'ouX8dwsbLCLv',
      ou_org_id: 'orNVthTo2Zyo',
      payment_id: 'paysAflHgG1Jk',
      personal: false,
      reversed: false,
      settlement_id: null,
      state: 'INITIALIZED',
      transaction_type: 'debit',
      tx_split_group_id: null,
      txn_details: null,
      txn_dt: '2022-08-12T00:00:00',
      updated_at: '2022-12-18T15:54:05.164101',
      us_email: 'ajain@fyle.in',
      us_full_name: 'Abhishek Jain',
      vendor: 'Test merchant',
    },
  ],
  limit: 1,
  offset: 0,
  url: '/v2/corporate_card_transactions',
};

export const apiAuthEouResponse = {
  ou: {
    id: 'ouX8dwsbLCLv',
    created_at: new Date('2018-02-01T02:32:25.267Z'),
    org_id: 'orNVthTo2Zyo',
    user_id: 'usvKA4X8Ugcr',
    employee_id: '',
    location: 'Mumbai',
    level: '123',
    level_id: 'lvlPtroPaClQy',
    band: 'Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name Very Long Level name',
    rank: 1121212121,
    business_unit:
      'A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed A very long Business Unit indeed',
    department_id: 'deptpmQ0SsMO0S',
    department: '0000000',
    sub_department: null,
    roles: ['FINANCE', 'ADMIN', 'APPROVER', 'FYLER', 'VERIFIER', 'PAYMENT_PROCESSOR', 'AUDITOR', 'HOP', 'HOD', 'OWNER'],
    approver1_id: null,
    approver2_id: 'oubQzXeZbwbS',
    approver3_id: null,
    delegatee_id: 'ouUyGK6JL2YT',
    delegation_start_at: '2022-12-02T18:30:00.000Z',
    delegation_end_at: '2022-12-10T18:29:59.999Z',
    title: 'director',
    status: 'ACTIVE',
    branch_ifsc: 'ICIC0002322',
    branch_account: null,
    mobile: '+919764989821',
    mobile_verified: false,
    mobile_verified_at: null,
    is_primary: true,
    owner: false,
    joining_dt: '2017-07-25T00:00:00.000+0000',
    special_email: 'receipts+ajain_6@fyle.ai',
    custom_field_values: [
      {
        id: 415,
        name: 'nj',
        value: 2222,
      },
      {
        id: 790,
        name: 'nj1233',
        value: 'hvgv',
      },
      {
        id: 792,
        name: 'nj12331',
        value: 'asdf',
      },
      {
        id: 793,
        name: 'nj123312',
        value: 'asd',
      },
      {
        id: 685,
        name: 'Hybrid human',
        value: null,
      },
      {
        id: 432,
        name: 'USelect',
        value: 'cho1',
      },
      {
        id: 139,
        name: 'Fuel limit',
        value: null,
      },
      {
        id: 430,
        name: 'UNum1',
        value: null,
      },
      {
        id: 138,
        name: 'Driver salary limit',
        value: 1122,
      },
      {
        id: 638,
        name: 'sdfgf',
        value: 123,
      },
      {
        id: 459,
        name: 'multi',
        value: '',
      },
      {
        id: 495,
        name: 'test multi',
        value: ['ch001'],
      },
      {
        id: 456,
        name: 'Place',
        value: null,
      },
      {
        id: 458,
        name: 'Location',
        value: null,
      },
      {
        id: 609,
        name: 'TCF',
        value: null,
      },
      {
        id: 140,
        name: 'Effective date',
        value: null,
      },
      {
        id: 85,
        name: 'permissive level',
        value: false,
      },
    ],
    org_name: 'Staging Loaded',
    settings_id: 'ousS9MgDNQ6NB',
    default_cost_center_id: null,
    default_cost_center_name: null,
    default_cost_center_code: null,
    cost_center_ids: [13792, 13793, 13794, 14018, 13795, 13995, 9493, 9494, 13785, 13787, 13788, 13789, 13790, 13791],
  },
  org: {
    domain: 'fyle.in',
    currency: 'INR',
  },
  us: {
    id: 'usvKA4X8Ugcr',
    created_at: new Date('2016-06-13T12:21:16.803Z'),
    full_name: 'Abhishek',
    email: 'ajain@fyle.in',
    email_verified_at: new Date('2022-09-06T05:26:19.898Z'),
    onboarded: true,
  },
  ap1: {
    full_name: null,
    email: null,
  },
  ap2: {
    full_name: 'AA23',
    email: 'ajain+12+12+1@fyle.in',
  },
  ap3: {
    full_name: null,
    email: null,
  },
  bb: {
    bank_name: 'ICICI BANK LIMITED',
  },
  dwolla: {
    customer_id: 'dwcJzfwZCgwkdfG',
    bank_account_added: true,
  },
};

export const expectedSingleTransaction = {
  _search_document: "'19202.0':1 '19202.00':2 'inr':3 'merchant':5 'test':4",
  amount: 19202,
  balance_transfer_id: null,
  balance_transfer_settlement_id: null,
  bank_txn_id: 'btxnByM07Fbm0e',
  corporate_credit_card_account_number: 'XXXXXXXXXXXX8090',
  created_at: new Date('2022-12-08T06:38:04.561Z'),
  creator_id: 'ouX8dwsbLCLv',
  currency: 'INR',
  description: null,
  group_amount: 19202,
  group_id: 'ccceRhYsN8Fj78',
  id: 'ccceRhYsN8Fj78',
  ignored: false,
  matched_at: null,
  matched_by: null,
  orig_amount: null,
  orig_currency: null,
  ou_department_id: 'deptpmQ0SsMO0S',
  ou_id: 'ouX8dwsbLCLv',
  ou_org_id: 'orNVthTo2Zyo',
  payment_id: 'paysAflHgG1Jk',
  personal: false,
  reversed: false,
  settlement_id: null,
  state: 'INITIALIZED',
  transaction_type: 'debit',
  tx_split_group_id: null,
  txn_details: null,
  txn_dt: new Date('2022-08-11T13:00:00.000Z'),
  updated_at: new Date('2022-12-18T10:24:05.164Z'),
  us_email: 'ajain@fyle.in',
  us_full_name: 'Abhishek Jain',
  vendor: 'Test merchant',
};

export const apiExpAndCCC = {
  data: [
    {
      aggregates: [
        {
          function_name: 'count(tx_id)',
          function_value: 1095,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 591841.142,
        },
      ],
      dimensions: [],
      name: 'scalar_stat',
    },
    {
      dimensions: ['corporate_credit_card_bank_name'],
      name: '1',
      value: [
        {
          aggregates: [
            {
              function_name: 'count(tx_id)',
              function_value: 1,
            },
            {
              function_name: 'sum(tx_amount)',
              function_value: 706,
            },
          ],
          key: [
            {
              column_name: 'corporate_credit_card_bank_name',
              column_value: 'DAMNA',
            },
            {
              column_name: 'corporate_credit_card_account_number',
              column_value: '8698',
            },
            {
              column_name: 'tx_state',
              column_value: 'COMPLETE',
            },
          ],
        },
        {
          aggregates: [
            {
              function_name: 'count(tx_id)',
              function_value: 971,
            },
            {
              function_name: 'sum(tx_amount)',
              function_value: 573548,
            },
          ],
          key: [
            {
              column_name: 'corporate_credit_card_bank_name',
              column_value: 'DAMNA',
            },
            {
              column_name: 'corporate_credit_card_account_number',
              column_value: '8698',
            },
            {
              column_name: 'tx_state',
              column_value: 'DRAFT',
            },
          ],
        },
        {
          aggregates: [
            {
              function_name: 'count(tx_id)',
              function_value: 7,
            },
            {
              function_name: 'sum(tx_amount)',
              function_value: 524.76,
            },
          ],
          key: [
            {
              column_name: 'corporate_credit_card_bank_name',
              column_value: 'PEX BANK',
            },
            {
              column_name: 'corporate_credit_card_account_number',
              column_value: '869',
            },
            {
              column_name: 'tx_state',
              column_value: 'COMPLETE',
            },
          ],
        },
        {
          aggregates: [
            {
              function_name: 'count(tx_id)',
              function_value: 105,
            },
            {
              function_name: 'sum(tx_amount)',
              function_value: 6398.842,
            },
          ],
          key: [
            {
              column_name: 'corporate_credit_card_bank_name',
              column_value: 'PEX BANK',
            },
            {
              column_name: 'corporate_credit_card_account_number',
              column_value: '869',
            },
            {
              column_name: 'tx_state',
              column_value: 'DRAFT',
            },
          ],
        },
        {
          aggregates: [
            {
              function_name: 'count(tx_id)',
              function_value: 9,
            },
            {
              function_name: 'sum(tx_amount)',
              function_value: 2623.58,
            },
          ],
          key: [
            {
              column_name: 'corporate_credit_card_bank_name',
              column_value: 'TEST-999',
            },
            {
              column_name: 'corporate_credit_card_account_number',
              column_value: '6975',
            },
            {
              column_name: 'tx_state',
              column_value: 'DRAFT',
            },
          ],
        },
        {
          aggregates: [
            {
              function_name: 'count(tx_id)',
              function_value: 1,
            },
            {
              function_name: 'sum(tx_amount)',
              function_value: 5782.73,
            },
          ],
          key: [
            {
              column_name: 'corporate_credit_card_bank_name',
              column_value: null,
            },
            {
              column_name: 'corporate_credit_card_account_number',
              column_value: 'Sample-Bank-xxx3420',
            },
            {
              column_name: 'tx_state',
              column_value: 'DRAFT',
            },
          ],
        },
        {
          aggregates: [
            {
              function_name: 'count(tx_id)',
              function_value: 1,
            },
            {
              function_name: 'sum(tx_amount)',
              function_value: 2257.23,
            },
          ],
          key: [
            {
              column_name: 'corporate_credit_card_bank_name',
              column_value: null,
            },
            {
              column_name: 'corporate_credit_card_account_number',
              column_value: 'Sample-Bank-xxxxxx-99171',
            },
            {
              column_name: 'tx_state',
              column_value: 'DRAFT',
            },
          ],
        },
      ],
    },
  ],
  url: '/v2/expenses_and_ccce/stats',
};

export const uniqueCardsReponse = [
  {
    cardNumber: '8698',
    cardName: 'DAMNA',
  },
  {
    cardNumber: '8698',
    cardName: 'DAMNA',
  },
  {
    cardNumber: '869',
    cardName: 'PEX BANK',
  },
  {
    cardNumber: '869',
    cardName: 'PEX BANK',
  },
  {
    cardNumber: '6975',
    cardName: 'TEST-999',
  },
  {
    cardNumber: 'Sample-Bank-xxx3420',
    cardName: null,
  },
  {
    cardNumber: 'Sample-Bank-xxxxxx-99171',
    cardName: null,
  },
];

export const expectedCardResponse = {
  totalTxns: 1095,
  totalAmount: 591841.142,
  cardDetails: [
    {
      aggregates: [
        {
          function_name: 'count(tx_id)',
          function_value: 1,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 706,
        },
      ],
      key: [
        {
          column_name: 'corporate_credit_card_bank_name',
          column_value: 'DAMNA',
        },
        {
          column_name: 'corporate_credit_card_account_number',
          column_value: '8698',
        },
        {
          column_name: 'tx_state',
          column_value: 'COMPLETE',
        },
      ],
    },
    {
      aggregates: [
        {
          function_name: 'count(tx_id)',
          function_value: 971,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 573548,
        },
      ],
      key: [
        {
          column_name: 'corporate_credit_card_bank_name',
          column_value: 'DAMNA',
        },
        {
          column_name: 'corporate_credit_card_account_number',
          column_value: '8698',
        },
        {
          column_name: 'tx_state',
          column_value: 'DRAFT',
        },
      ],
    },
    {
      aggregates: [
        {
          function_name: 'count(tx_id)',
          function_value: 7,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 524.76,
        },
      ],
      key: [
        {
          column_name: 'corporate_credit_card_bank_name',
          column_value: 'PEX BANK',
        },
        {
          column_name: 'corporate_credit_card_account_number',
          column_value: '869',
        },
        {
          column_name: 'tx_state',
          column_value: 'COMPLETE',
        },
      ],
    },
    {
      aggregates: [
        {
          function_name: 'count(tx_id)',
          function_value: 105,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 6398.842,
        },
      ],
      key: [
        {
          column_name: 'corporate_credit_card_bank_name',
          column_value: 'PEX BANK',
        },
        {
          column_name: 'corporate_credit_card_account_number',
          column_value: '869',
        },
        {
          column_name: 'tx_state',
          column_value: 'DRAFT',
        },
      ],
    },
    {
      aggregates: [
        {
          function_name: 'count(tx_id)',
          function_value: 9,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 2623.58,
        },
      ],
      key: [
        {
          column_name: 'corporate_credit_card_bank_name',
          column_value: 'TEST-999',
        },
        {
          column_name: 'corporate_credit_card_account_number',
          column_value: '6975',
        },
        {
          column_name: 'tx_state',
          column_value: 'DRAFT',
        },
      ],
    },
    {
      aggregates: [
        {
          function_name: 'count(tx_id)',
          function_value: 1,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 5782.73,
        },
      ],
      key: [
        {
          column_name: 'corporate_credit_card_bank_name',
          column_value: null,
        },
        {
          column_name: 'corporate_credit_card_account_number',
          column_value: 'Sample-Bank-xxx3420',
        },
        {
          column_name: 'tx_state',
          column_value: 'DRAFT',
        },
      ],
    },
    {
      aggregates: [
        {
          function_name: 'count(tx_id)',
          function_value: 1,
        },
        {
          function_name: 'sum(tx_amount)',
          function_value: 2257.23,
        },
      ],
      key: [
        {
          column_name: 'corporate_credit_card_bank_name',
          column_value: null,
        },
        {
          column_name: 'corporate_credit_card_account_number',
          column_value: 'Sample-Bank-xxxxxx-99171',
        },
        {
          column_name: 'tx_state',
          column_value: 'DRAFT',
        },
      ],
    },
  ],
};

export const statsResponse = [
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 1,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 706,
      },
    ],
    key: [
      {
        column_name: 'corporate_credit_card_bank_name',
        column_value: 'DAMNA',
      },
      {
        column_name: 'corporate_credit_card_account_number',
        column_value: '8698',
      },
      {
        column_name: 'tx_state',
        column_value: 'COMPLETE',
      },
    ],
  },
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 971,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 573548,
      },
    ],
    key: [
      {
        column_name: 'corporate_credit_card_bank_name',
        column_value: 'DAMNA',
      },
      {
        column_name: 'corporate_credit_card_account_number',
        column_value: '8698',
      },
      {
        column_name: 'tx_state',
        column_value: 'DRAFT',
      },
    ],
  },
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 7,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 524.76,
      },
    ],
    key: [
      {
        column_name: 'corporate_credit_card_bank_name',
        column_value: 'PEX BANK',
      },
      {
        column_name: 'corporate_credit_card_account_number',
        column_value: '869',
      },
      {
        column_name: 'tx_state',
        column_value: 'COMPLETE',
      },
    ],
  },
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 105,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 6398.842,
      },
    ],
    key: [
      {
        column_name: 'corporate_credit_card_bank_name',
        column_value: 'PEX BANK',
      },
      {
        column_name: 'corporate_credit_card_account_number',
        column_value: '869',
      },
      {
        column_name: 'tx_state',
        column_value: 'DRAFT',
      },
    ],
  },
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 9,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 2623.58,
      },
    ],
    key: [
      {
        column_name: 'corporate_credit_card_bank_name',
        column_value: 'TEST-999',
      },
      {
        column_name: 'corporate_credit_card_account_number',
        column_value: '6975',
      },
      {
        column_name: 'tx_state',
        column_value: 'DRAFT',
      },
    ],
  },
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 1,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 5782.73,
      },
    ],
    key: [
      {
        column_name: 'corporate_credit_card_bank_name',
        column_value: null,
      },
      {
        column_name: 'corporate_credit_card_account_number',
        column_value: 'Sample-Bank-xxx3420',
      },
      {
        column_name: 'tx_state',
        column_value: 'DRAFT',
      },
    ],
  },
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 1,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 2257.23,
      },
    ],
    key: [
      {
        column_name: 'corporate_credit_card_bank_name',
        column_value: null,
      },
      {
        column_name: 'corporate_credit_card_account_number',
        column_value: 'Sample-Bank-xxxxxx-99171',
      },
      {
        column_name: 'tx_state',
        column_value: 'DRAFT',
      },
    ],
  },
];

export const eCCCApiResponse = [
  {
    ccce_id: 'ccceYIJhT8Aj6U',
    ccce_created_at: '2021-03-26T09:29:14.586Z',
    ccce_updated_at: '2022-01-07T11:53:53.588Z',
    ccce_txn_dt: '2018-06-26T10:00:00.000Z',
    ccce_creator_id: null,
    ccce_orig_currency: null,
    ccce_orig_amount: null,
    ccce_currency: 'INR',
    ccce_amount: 30.98,
    ccce_description: 'AMAZON.COM, SEATTLE, WA',
    ccce_vendor: 'AMAZON.COM',
    ccce_payment_id: 'pay4KzfYhLEvS',
    ccce_settlement_id: 'setxPixUhOPVL',
    ccce_state: 'IN_PROGRESS',
    personal: false,
    matched_by: 'ouX8dwsbLCLv',
    matched_at: '2022-01-07T11:53:52.588Z',
    tx_split_group_id: 'tx1FQMblw3XF',
    tx_split_group_user_amount: null,
    ccce_group_id: 'ccceYIJhT8Aj6U',
    reversed: false,
    bank_txn_id: 'btxnMy43OZokde',
    ccce_card_or_account_number: '869',
    ou_id: 'ouX8dwsbLCLv',
    ou_org_id: 'orNVthTo2Zyo',
    us_full_name: 'Abhishek Jain',
    us_email: 'ajain@fyle.in',
    ccce_balance_transfer_id: null,
    balance_transfer_settlement_id: null,
    ou_department_id: 'deptpmQ0SsMO0S',
    tx_project_id: null,
  },
];

export const expectedECccResponse = [
  {
    ccce: {
      id: 'ccceYIJhT8Aj6U',
      created_at: '2021-03-26T09:29:14.586Z',
      updated_at: '2022-01-07T11:53:53.588Z',
      txn_dt: '2018-06-26T10:00:00.000Z',
      creator_id: null,
      orig_currency: null,
      orig_amount: null,
      currency: 'INR',
      amount: 30.98,
      description: 'AMAZON.COM, SEATTLE, WA',
      vendor: 'AMAZON.COM',
      payment_id: 'pay4KzfYhLEvS',
      settlement_id: 'setxPixUhOPVL',
      state: 'IN_PROGRESS',
      group_id: 'ccceYIJhT8Aj6U',
      card_or_account_number: '869',
      balance_transfer_id: null,
    },
    personal: false,
    matched: {
      by: 'ouX8dwsbLCLv',
      at: '2022-01-07T11:53:52.588Z',
    },
    tx: {
      split_group_id: 'tx1FQMblw3XF',
      split_group_user_amount: null,
      project_id: null,
    },
    reversed: false,
    bank: {
      txn_id: 'btxnMy43OZokde',
    },
    ou: {
      id: 'ouX8dwsbLCLv',
      org_id: 'orNVthTo2Zyo',
      department_id: 'deptpmQ0SsMO0S',
    },
    us: {
      full_name: 'Abhishek Jain',
      email: 'ajain@fyle.in',
    },
    balance: {
      transfer_settlement_id: null,
    },
  },
];
