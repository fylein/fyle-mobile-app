import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PlatformMerchant } from '../models/platform/platform-merchants.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { VendorService } from './vendor.service';

const mockMerchants: PlatformMerchant[] = [
  {
    id: 309,
    display_name: 'Fuel Station',
    created_at: new Date('2017-06-18T15:52:26.857075Z'),
    updated_at: new Date('2020-06-09T19:16:44.618140Z'),
    org_id: 'orh7SigX1sfN',
  },
  {
    id: 437,
    display_name: 'Fedex',
    created_at: new Date('2017-06-18T15:52:26.857075Z'),
    updated_at: new Date('2019-07-10T12:07:59.158939Z'),
    org_id: 'orh7SigX1sfN',
  },
  {
    id: 314,
    display_name: 'Fastrak',
    created_at: new Date('2017-06-18T15:52:26.857075Z'),
    updated_at: new Date('2020-10-14T07:19:18.958436Z'),
    org_id: 'orh7SigX1sfN',
  },
  {
    id: 101,
    display_name: 'Fyle Store',
    created_at: new Date('2017-01-30T08:09:24.393267Z'),
    updated_at: new Date('2020-11-03T17:12:50.250702Z'),
    org_id: 'orh7SigX1sfN',
  },
];

const mockApiResponse: PlatformApiResponse<PlatformMerchant[]> = {
  count: 4,
  data: mockMerchants,
  offset: 0,
};

describe('VendorService', () => {
  let vendorService: VendorService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        VendorService,
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
      ],
    });
    vendorService = TestBed.inject(VendorService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService,
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
  });

  it('should be created', () => {
    expect(vendorService).toBeTruthy();
  });

  it('should return merchants after querying with search string', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(mockApiResponse));

    vendorService.getMerchants('Fuel').subscribe((merchants) => {
      expect(merchants).toEqual(mockMerchants);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledWith('/merchants', {
        params: {
          q: 'Fuel',
          limit: 4,
        },
      });
      done();
    });
  });
});
