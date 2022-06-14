import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { TaxGroupService } from './tax-group.service';

const taxGroupPlatformResponse = {
  count: 2,
  data: [
    {
      id: 'tgwfjbgqo32',
      org_id: 'orwruogwnngg',
      created_at: new Date('2020-06-01T13:14:54.804+00:00'),
      updated_at: new Date('2020-06-11T13:14:55.201598+00:00'),
      name: 'GST',
      percentage: 18,
      is_enabled: true,
      code: 'C1234',
    },
    {
      id: 'tgwfjbgqo35',
      org_id: 'orwruogwnngg',
      created_at: new Date('2020-06-01T13:14:54.804+00:00'),
      updated_at: new Date('2020-06-11T13:14:55.201598+00:00'),
      name: 'VAT',
      percentage: 20,
      is_enabled: true,
      code: 'C1234',
    },
  ],
  offset: 0,
};

const transformedTaxGroupData = [
  {
    id: 'tgwfjbgqo32',
    name: 'GST',
    percentage: 18,
    created_at: new Date('2020-06-01T13:14:54.804+00:00'),
    updated_at: new Date('2020-06-11T13:14:55.201598+00:00'),
    org_id: 'orwruogwnngg',
    is_enabled: true,
  },
  {
    id: 'tgwfjbgqo35',
    name: 'VAT',
    percentage: 20,
    created_at: new Date('2020-06-01T13:14:54.804+00:00'),
    updated_at: new Date('2020-06-11T13:14:55.201598+00:00'),
    org_id: 'orwruogwnngg',
    is_enabled: true,
  },
];

describe('TaxGroupService', () => {
  let taxGroupService: TaxGroupService;
  let spenderPlatformApiService: jasmine.SpyObj<SpenderPlatformApiService>;

  beforeEach(() => {
    const spenderPlatformApiServiceSpy = jasmine.createSpyObj('SpenderPlatformApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        TaxGroupService,
        {
          provide: SpenderPlatformApiService,
          useValue: spenderPlatformApiServiceSpy,
        },
      ],
    });
    taxGroupService = TestBed.inject(TaxGroupService);
    spenderPlatformApiService = TestBed.inject(SpenderPlatformApiService) as jasmine.SpyObj<SpenderPlatformApiService>;
  });

  it('should be created', () => {
    expect(taxGroupService).toBeTruthy();
  });

  it('should return proper response from api and transform it into proper model', (done) => {
    spenderPlatformApiService.get.and.returnValue(of(taxGroupPlatformResponse));

    taxGroupService.get().subscribe((taxGroups) => {
      expect(taxGroups).toEqual(transformedTaxGroupData);
      done();
    });
  });
});
