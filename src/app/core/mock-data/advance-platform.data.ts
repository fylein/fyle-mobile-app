import deepFreeze from 'deep-freeze-strict';

import { CustomFieldTypes } from '../enums/platform/v1/custom-fields-type.enum';
import { AdvancesPlatform } from '../models/platform/advances-platform.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';

export const advancePlatform: PlatformApiResponse<AdvancesPlatform[]> = deepFreeze({
  count: 1,
  offset: 0,
  data: [
    {
      advance_account_id: 'accmwN4nDBMXM',
      advance_request_id: 'areqrttywiidF8',
      advance_wallet_id: null,
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
        {
          name: 'Project Name',
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
      issued_at: new Date('2024-03-11T08:32:27.449000+00:00'),
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
      user: {
        email: 'ajain@fyle.in',
        full_name: 'Abhishek Jain test',
        id: 'usvKA4X8Ugcr',
      },
      user_id: 'usvKA4X8Ugcr',
      advance_request: {
        id: 'areq1234',
        last_approved_at: new Date('2024-03-14T08:32:40.861Z'),
      },
    },
  ],
});
