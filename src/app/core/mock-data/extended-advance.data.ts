import deepFreeze from 'deep-freeze-strict';

import { ExtendedAdvance } from '../models/extended_advance.model';
import { ApiV2Response } from '../models/api-v2.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { AdvancesPlatform } from '../models/platform/advances-platform.model';
import { CustomFieldTypes } from '../enums/platform/v1/custom-fields-type.enum';

export const singleExtendedAdvancesData: ApiV2Response<ExtendedAdvance> = deepFreeze({
  count: 1,
  data: [
    {
      adv_advance_number: 'A/2024/03/T/1',
      adv_amount: 5044,
      adv_card_number: null,
      adv_created_at: new Date('2024-03-11T08:32:40.861Z'),
      adv_currency: 'INR',
      adv_exported: false,
      adv_id: 'advRhdN9D326Y',
      adv_issued_at: new Date('2024-03-11T08:32:27.449Z'),
      adv_mode: 'CASH',
      adv_orig_amount: null,
      adv_orig_currency: null,
      adv_purpose: 'testing',
      adv_refcode: null,
      adv_source: 'WEBAPP',
      areq_id: 'areqrttywiidF8',
      assignee_department_id: 'dept62zPkMskdX',
      assignee_ou_id: 'ouX8dwsbLCLv',
      assignee_ou_org_id: 'orNVthTo2Zyo',
      assignee_us_email: 'ajain@fyle.in',
      assignee_us_full_name: 'Abhishek Jain test',
      project_code: null,
      project_id: 317383,
      project_name: 'AAAO2683 / TE02257 AURI',
      type: 'advance',
      creator_us_full_name: 'Neeraj D',
      areq_approved_at: new Date('2024-03-14T08:32:40.861Z'),
    },
  ],
  offset: 0,
});

export const extendedAdvWithDates = deepFreeze({
  ...singleExtendedAdvancesData,
  adv_created_at: new Date('2019-10-31T04:36:01.927Z'),
  adv_issued_at: new Date('2019-10-31T04:35:10.391Z'),
});

export const extendedAdvWithoutDates = deepFreeze({
  ...singleExtendedAdvancesData,
  adv_created_at: '2019-10-31T04:36:01.927Z',
  adv_issued_at: '2019-10-31T04:35:10.391Z',
});

export const singleExtendedAdvancesData2: ApiV2Response<ExtendedAdvance> = deepFreeze({
  count: 11,
  data: [
    {
      adv_advance_number: 'A/2019/10/T/49',
      adv_amount: 300,
      adv_card_number: null,
      adv_created_at: new Date('2019-10-31T04:36:01.927Z'),
      adv_currency: 'INR',
      adv_exported: false,
      adv_id: 'advETmi3eePvQ',
      adv_issued_at: new Date('2019-10-31T04:35:10.391Z'),
      adv_mode: 'BANK_TRANSFER',
      adv_orig_amount: null,
      adv_orig_currency: null,
      adv_purpose: 'New advance-2',
      adv_refcode: null,
      adv_source: 'WEBAPP',
      areq_id: 'areqmq8cmnd5v4',
      assignee_department_id: 'deptYSONXoGd64',
      assignee_ou_id: 'ourw7Hi4mmpO',
      assignee_ou_org_id: 'orNVthTo2Zyo',
      assignee_us_email: 'dimple.kh@fyle.in',
      assignee_us_full_name: 'Dimple',
      project_code: 'Pc10wqpt',
      project_id: null,
      project_name: null,
      creator_us_full_name: 'Ajain',
      areq_approved_at: new Date('2024-03-14T08:32:40.861Z'),
    },
  ],
  limit: 1,
  offset: 0,
  url: '/v2/advances',
});

export const singleExtendedAdvancesData3: ExtendedAdvance = deepFreeze({
  ...singleExtendedAdvancesData.data[0],
  type: 'advance',
  amount: 5044,
  orig_amount: null,
  created_at: new Date('2024-03-11T08:32:40.861Z'),
  currency: 'INR',
  orig_currency: null,
  purpose: 'testing',
});

export const platformAdvanceData: PlatformApiResponse<AdvancesPlatform[]> = deepFreeze({
  count: 11,
  offset: 200,
  data: [
    {
      advance_request_id: 'areqrttywiidF8',
      amount: 5044,
      card_number: null,
      code: null,
      created_at: new Date('2024-03-11T08:32:40.861889+00:00'),
      creator_user: {
        email: 'neeraj.durgapal@fyle.in',
        full_name: 'Neeraj D',
        id: 'us1ymEVgUKqb',
      },
      currency: 'INR',
      custom_fields: [
        {
          name: '123',
          type: CustomFieldTypes.TEXT,
          value: null,
        },
      ],
      employee: {
        code: '1223',
        department: {
          code: null,
          display_name: 'mileage dept / arun',
          id: 'dept62zPkMskdX',
          name: 'mileage dept',
          sub_department: 'arun',
        },
        department_id: 'dept62zPkMskdX',
        id: 'ouX8dwsbLCLv',
        org_id: 'orNVthTo2Zyo',
        user: {
          email: 'ajain@fyle.in',
          full_name: 'Abhishek Jain test',
          id: 'usvKA4X8Ugcr',
        },
        user_id: 'usvKA4X8Ugcr',
        mobile: '+1234567890',
        is_mobile_verified: true,
        sms_opt_out_source: null,
      },
      employee_id: 'ouX8dwsbLCLv',
      foreign_amount: null,
      foreign_currency: null,
      id: 'advRhdN9D326Y',
      is_exported: false,
      last_exported_at: null,
      org_id: 'orNVthTo2Zyo',
      payment_mode: 'CASH',
      project: {
        code: null,
        display_name: 'AAAO2683 / TE02257 AURI',
        id: 317383,
        name: 'AAAO2683 / TE02257 AURI',
        sub_project: null,
      },
      project_id: '317383',
      purpose: 'testing',
      seq_num: 'A/2024/03/T/1',
      source: 'WEBAPP',
      updated_at: new Date('2024-03-11T08:32:40.861889+00:00'),
      issued_at: new Date('2024-03-11T08:32:40.861889+00:00'),
      advance_account_id: null,
      advance_wallet_id: null,
      user: {
        email: 'ajain@fyle.in',
        full_name: 'Abhishek Jain test',
        id: 'usvKA4X8Ugcr',
      },
      user_id: 'usvKA4X8Ugcr',
    },
  ],
});
