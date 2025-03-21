import deepFreeze from 'deep-freeze-strict';

import { cloneDeep } from 'lodash';
import { CustomFieldTypes } from 'src/app/core/enums/platform/v1/custom-fields-type.enum';
import { AdvanceRequestPlatform } from 'src/app/core/models/platform/advance-request-platform.model';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';

export const advanceRequestPlatform: PlatformApiResponse<AdvanceRequestPlatform[]> = deepFreeze({
  count: 1,
  offset: 0,
  data: [
    {
      advance: {
        id: 'advkvnwrnpwi',
        currency: 'USD',
        amount: 47.99,
        advance_request_id: 'advjrgwlk2Q',
        seq_num: 'A/2020/10/T/95',
      },
      id: 'areqiwr3Wwirr',
      user_id: 'uswjwgnwwgo',
      user: {
        id: 'uswjwgnwwgo',
        email: 'john.doe@example.com',
        full_name: 'John Doe',
      },
      approvals: [
        {
          approver_user_id: 'usge49ielgel',
          approver_user: {
            id: 'uswjwgnwwgo',
            email: 'john.doe@example.com',
            full_name: 'John Doe',
          },
          state: 'APPROVAL_PENDING',
        },
      ],
      org_id: 'orwruogwnngg',
      created_at: new Date('2020-06-01T13:14:54.804+00:00'),
      updated_at: new Date('2020-06-11T13:14:55.201598+00:00'),
      currency: 'USD',
      amount: 47.99,
      policy_amount: 1500,
      advance_id: 'advjrgwlk2Q',
      seq_num: 'A/2020/10/T/95',
      code: 'C1234',
      notes: 'onsite client meeting',
      purpose: 'onsite client meeting',
      source: 'WEBAPP',
      state: 'DRAFT',
      project_id: '1234',
      project: {
        id: 1234,
        name: 'Fast and Furious',
        sub_project: 'Formula One',
        code: 'C1234',
        display_name: 'Fast and Furious / Formula One',
      },
      is_exported: true,
      employee_id: 'outGt9ju6qP',
      employee: {
        code: null,
        department: {
          code: null,
          display_name: 'Tech',
          id: 'deptCjFrZcE0rH',
          name: 'Tech',
          sub_department: 'Tech',
        },
        department_id: 'deptCjFrZcE0rH',
        id: 'ouirDZ7tTLEQ',
        org_id: 'orNVthTo2Zyo',
        user: {
          email: 'arjun.m@fyle.in',
          full_name: 'Arjun',
          id: 'usJZ9bgfNB5n',
        },
        user_id: 'usJZ9bgfNB5n',
      },
      last_approved_at: new Date('2020-06-14T13:14:55.201598+00:00'),
      custom_fields: [
        {
          name: 'checking',
          value: 'true',
          type: CustomFieldTypes.BOOLEAN,
        },
      ],
    },
  ],
});

export const advanceRequestPlatformPulledBack: PlatformApiResponse<AdvanceRequestPlatform[]> = deepFreeze({
  count: 1,
  offset: 0,
  data: [
    {
      ...cloneDeep(advanceRequestPlatform.data[0]),
      state: 'PULLED_BACK',
      id: 'areqiwr3Wwirl',
    },
  ],
});

export const advanceRequestPlatformSentBack: PlatformApiResponse<AdvanceRequestPlatform[]> = deepFreeze({
  count: 1,
  offset: 0,
  data: [
    {
      ...cloneDeep(advanceRequestPlatform.data[0]),
      id: 'areqiwr3Wwirk',
      state: 'SENT_BACK',
    },
  ],
});
