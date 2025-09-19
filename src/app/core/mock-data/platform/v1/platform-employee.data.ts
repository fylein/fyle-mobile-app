import deepFreeze from 'deep-freeze-strict';
import { DelegationType } from 'src/app/core/models/platform/delegation-type.enum';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { PlatformEmployee } from 'src/app/core/models/platform/platform-employee.model';

export const platformEmployeeData: PlatformEmployee = deepFreeze({
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
  mobile: '+1234567890',
  is_mobile_verified: true,
  sms_opt_out_source: null,
  delegatees: [
    {
      id: 100,
      type: DelegationType.PERMANENT,
      user_id: '0x1234',
      email: 'test@mail.in',
      full_name: 'Vercetti',
      start_at: new Date(),
      end_at: null,
    },
  ],
});

export const platformEmployeeResponse: PlatformApiResponse<PlatformEmployee[]> = deepFreeze({
  count: 1,
  offset: 10,
  data: [platformEmployeeData],
});

export const platformEmployeeEmptyResponse: PlatformApiResponse<PlatformEmployee[]> = deepFreeze({
  count: 1,
  offset: 10,
  data: null,
});
