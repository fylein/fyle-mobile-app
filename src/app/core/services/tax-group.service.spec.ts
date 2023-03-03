import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-beta-api.service';
import { TaxGroupService } from './tax-group.service';
import { PAGINATION_SIZE } from 'src/app/constants';
import { globalCacheBusterNotifier } from 'ts-cacheable';

const taxGroupPlatformResponse = {
  count: 2,
  data: [
    {
      id: 'tgwfjbgqo32',
      org_id: 'orwruogwnngg',
      created_at: '2020-06-01T13:14:54.804+00:00',
      updated_at: '2020-06-11T13:14:55.201598+00:00',
      name: 'GST',
      percentage: 18,
      is_enabled: true,
      code: 'C1234',
    },
    {
      id: 'tgwfjbgqo35',
      org_id: 'orwruogwnngg',
      created_at: '2020-06-01T13:14:54.804+00:00',
      updated_at: '2020-06-11T13:14:55.201598+00:00',
      name: 'VAT',
      percentage: 20,
      is_enabled: true,
      code: 'C1234',
    },
  ],
  offset: 0,
};

const taxGroupPlatformResponseSingle = {
  count: 1,
  data: [
    {
      id: 'tgwfjbgqo32',
      org_id: 'orwruogwnngg',
      created_at: '2020-06-01T13:14:54.804+00:00',
      updated_at: '2020-06-11T13:14:55.201598+00:00',
      name: 'GST',
      percentage: 18,
      is_enabled: true,
      code: 'C1234',
    },
  ],
  offset: 0,
};

const transformedTaxGroupDataSingle = [
  {
    id: 'tgwfjbgqo32',
    name: 'GST',
    percentage: 18,
    created_at: '2020-06-01T13:14:54.804+00:00',
    updated_at: '2020-06-11T13:14:55.201598+00:00',
    org_id: 'orwruogwnngg',
    is_enabled: true,
  },
];

const transformedTaxGroupData = [
  {
    id: 'tgwfjbgqo32',
    name: 'GST',
    percentage: 18,
    created_at: '2020-06-01T13:14:54.804+00:00',
    updated_at: '2020-06-11T13:14:55.201598+00:00',
    org_id: 'orwruogwnngg',
    is_enabled: true,
  },
  {
    id: 'tgwfjbgqo35',
    name: 'VAT',
    percentage: 20,
    created_at: '2020-06-01T13:14:54.804+00:00',
    updated_at: '2020-06-11T13:14:55.201598+00:00',
    org_id: 'orwruogwnngg',
    is_enabled: true,
  },
];

const fixDate = (data) =>
  data.map((data) => ({
    ...data,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  }));

describe('TaxGroupService', () => {
  let taxGroupService: TaxGroupService;
  let spenderPlatformV1BetaApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const spenderPlatformV1BetaApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        TaxGroupService,
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1BetaApiServiceSpy,
        },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
      ],
    });
    taxGroupService = TestBed.inject(TaxGroupService);
    spenderPlatformV1BetaApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    globalCacheBusterNotifier.next();
  });

  it('should be created', () => {
    expect(taxGroupService).toBeTruthy();
  });

  it('should be able to return single tax group', (done) => {
    spenderPlatformV1BetaApiService.get.and.returnValue(of(taxGroupPlatformResponseSingle));

    taxGroupService.get().subscribe((taxGroups) => {
      expect(taxGroups).toEqual(fixDate(transformedTaxGroupDataSingle));
      done();
    });
  });

  it('should return proper response from api and transform it into proper model', (done) => {
    spenderPlatformV1BetaApiService.get.and.returnValue(of(taxGroupPlatformResponse));

    taxGroupService.get().subscribe((taxGroups) => {
      expect(taxGroups).toEqual(fixDate(transformedTaxGroupData));
      done();
    });
  });
});
