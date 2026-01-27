import { TestBed } from '@angular/core/testing';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { userPasswordStatus } from '../mock-data/user-password-status.data';
import { UserService } from './user.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';

const currentUserResponse = {
  id: 'usvKA4X8Ugcr',
  created_at: '2016-06-13T12:21:16.803Z',
  updated_at: '2022-06-03T08:56:59.672Z',
  full_name: 'abhishek',
  email: 'ajain@fyle.in',
  signup_params: null,
  password: null,
  password_changed_at: '2022-02-28T09:57:54.767Z',
  email_verified: true,
  email_verified_at: '2022-04-25T15:23:51.312Z',
  onboarded: true,
};

const currentUser: User = {
  id: 'usvKA4X8Ugcr',
  created_at: new Date('2016-06-13T12:21:16.803Z'),
  updated_at: new Date('2022-06-03T08:56:59.672Z'),
  full_name: 'abhishek',
  email: 'ajain@fyle.in',
  signup_params: null,
  password: null,
  password_changed_at: new Date('2022-02-28T09:57:54.767Z'),
  email_verified: true,
  email_verified_at: new Date('2022-04-25T15:23:51.312Z'),
  onboarded: true,
};

const extendedOrgUser = {
  ou: {
    id: 'ou1yd9oLQz8h',
    created_at: new Date('2019-08-28T09:00:48.046Z'),
    org_id: 'orh7SigX1sfN',
    user_id: 'usvKA4X8Ugcr',
    employee_id: null,
    location: null,
    level: null,
    level_id: null,
    band: null,
    rank: null,
    business_unit: null,
    department_id: null,
    department: null,
    sub_department: null,
    roles: ['FYLER', 'APPROVER'],
    approver1_id: null,
    approver2_id: null,
    approver3_id: null,
    delegatee_id: null,
    delegation_start_at: null,
    delegation_end_at: null,
    title: null,
    status: 'ACTIVE',
    branch_ifsc: null,
    branch_account: null,
    mobile: '+919535079878',
    mobile_verified: true,
    mobile_verified_at: new Date('2021-02-15T15:17:50.809Z'),
    is_primary: false,
    owner: null,
    joining_dt: null,
    special_email: 'receipts+ajain_48@fyle.ai',
    custom_field_values: [],
    org_name: 'Abhishek',
    settings_id: 'ousjhFVgZTDwV',
    default_cost_center_id: null,
    default_cost_center_name: null,
    default_cost_center_code: null,
    cost_center_ids: [],
  },
  org: {
    currency: 'INR',
  },
  mileage_settings: {},
  us: {
    id: 'usvKA4X8Ugcr',
    created_at: new Date('2016-06-13T12:21:16.803Z'),
    full_name: 'abhishek',
    email: 'ajain@fyle.in',
    email_verified_at: new Date('2022-04-25T15:23:51.312Z'),
    onboarded: true,
  },
  ap1: { full_name: null, email: null },
  ap2: { full_name: null, email: null },
  ap3: { full_name: null, email: null },
  department: {
    id: null,
    code: null,
    name: null,
    sub_department: null,
    display_name: null,
  },
  approver_user_ids: [null, null, null],
  approver_users: [null, null, null],
  delegatees: [],
  locale: {
    timezone: 'Asia/Kolkata',
    abbreviation: 'IST',
    offset: '+05:30',
  },
  commute_details: {
    id: null,
    distance: 0,
    distance_unit: 'km',
    home_location: null,
    work_location: null,
  },
  commute_details_id: null,
  flattened_custom_field: {},
};

const userPropertiesRes = {
  id: 'usYzfH0uFaMW',
  created_at: '2020-07-09T04:53:00.051Z',
  updated_at: '2022-05-17T05:47:04.126Z',
  devices: [
    {
      id: '47D900B3-ECBC-4ED7-8311-4D45EA6D9595',
      fcm_token:
        'fTVuhDfBg0Gbrz1wUwiTsn:APA91bEXR8c5aITaGTTwQi_qqdhzA1hqqpmGMxUFo5rj1X7jWRlbziUNHJwUZZi0xvnaQMIB_TuVvFVFF3_eHHN049junGfZjzic7_L4c2d6BvxiU_WZ_XvnzPlRRiWqX9eghY_eAObW',
    },
    {
      id: 'D5510B11-3DFE-4FBC-8BEA-4AFAFA850B33',
      fcm_token:
        'cd_93HHzNkzBpRCwwECXkk:APA91bHsgk3-d5u8u3lnTojM0KCmnr7K1HYJ5Kh16H38vJkPZ2yqtpGAh45f6bIEzrVVTjIRIAa62fp62opeseQ9BLCXMnd9BrkoXYVe4DXyQM7ge8jF0snQXiJdYsjpY3_7GBiMYn-0',
    },
  ],
  reports_beta_view: {
    allowed: true,
    enabled: true,
  },
  company_expenses_beta: {
    allowed: true,
    enabled: true,
  },
  expense_form_beta: null,
};

describe('UserService', () => {
  let userService: UserService;
  let authService: jasmine.SpyObj<AuthService>;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        UserService,
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
      ],
    });
    userService = TestBed.inject(UserService);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService,
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
  });

  it('should be created', () => {
    expect(userService).toBeTruthy();
  });

  it('should be able to check if user is not in pending details state', (done) => {
    authService.getEou.and.returnValue(new Promise<ExtendedOrgUser>((resolve) => resolve(extendedOrgUser)));

    userService.isPendingDetails().subscribe((isPendingDetails) => {
      expect(isPendingDetails).toBeFalse();
      done();
    });
  });

  it('should be able to check if user is in pending details state', (done) => {
    const extendedOrgUserCopy = cloneDeep(extendedOrgUser);
    extendedOrgUserCopy.ou.status = 'PENDING_DETAILS';
    authService.getEou.and.returnValue(new Promise<ExtendedOrgUser>((resolve) => resolve(extendedOrgUserCopy)));

    userService.isPendingDetails().subscribe((isPendingDetails) => {
      expect(isPendingDetails).toBeTrue();
      done();
    });
  });

  it('getUserPasswordStatus() :should get the user password status', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of({ data: userPasswordStatus }));
    userService.getUserPasswordStatus().subscribe((res) => {
      expect(userPasswordStatus).toEqual(res);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/users/password_required');
      done();
    });
  });
});
