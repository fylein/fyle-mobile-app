import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExtendedOrgUser } from '../models/extended-org-user.model';
import { Vendor } from '../models/vendor.model';
import { AuthService } from './auth.service';
import { VendorService } from './vendor.service';

const vendors: Vendor[] = [
  {
    id: 309,
    cin: null,
    tin: null,
    display_name: 'Fuel',
    other_names: null,
    creator_id: 'SYSTEM',
    created_at: new Date('2017-06-18T15:52:26.857075Z'),
    updated_at: new Date('2020-06-09T19:16:44.618140Z'),
    default_category: null,
    verified: true,
  },
  {
    id: 437,
    cin: null,
    tin: null,
    display_name: 'Fedex',
    other_names: null,
    creator_id: 'SYSTEM',
    created_at: new Date('2017-06-18T15:52:26.857075Z'),
    updated_at: new Date('2019-07-10T12:07:59.158939Z'),
    default_category: null,
    verified: true,
  },
  {
    id: 314,
    cin: null,
    tin: null,
    display_name: 'Fastrak',
    other_names: null,
    creator_id: 'SYSTEM',
    created_at: new Date('2017-06-18T15:52:26.857075Z'),
    updated_at: new Date('2020-10-14T07:19:18.958436Z'),
    default_category: null,
    verified: true,
  },
  {
    id: 101,
    cin: null,
    tin: null,
    display_name: 'fyle.in',
    other_names: null,
    creator_id: 'ouD8bcoymzv3',
    created_at: new Date('2017-01-30T08:09:24.393267Z'),
    updated_at: new Date('2020-11-03T17:12:50.250702Z'),
    default_category: 'Unspecified',
    verified: true,
  },
];

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

describe('VendorService', () => {
  let vendorService: VendorService;
  let httpClient: jasmine.SpyObj<HttpClient>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);

    TestBed.configureTestingModule({
      providers: [
        VendorService,
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
      ],
    });
    vendorService = TestBed.inject(VendorService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(vendorService).toBeTruthy();
  });

  it('should return vendors after querying by user and querystring', (done) => {
    httpClient.get.and.returnValue(of(vendors));
    authService.getEou.and.returnValue(new Promise<ExtendedOrgUser>((resolve) => resolve(extendedOrgUser)));
    vendorService.setRoot('http://app.fylehq.com');

    vendorService.get('Alooo').subscribe((vendorsRes) => {
      expect(vendorsRes).toEqual(vendors);
      expect(httpClient.get).toHaveBeenCalledWith('http://app.fylehq.com/vendors/all', {
        params: {
          org_user_id: extendedOrgUser.ou.id,
          q: 'Alooo',
        },
      });
      done();
    });
  });
});
