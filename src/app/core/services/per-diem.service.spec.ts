import { TestBed } from '@angular/core/testing';
import { PerDiemService } from './per-diem.service';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { PAGINATION_SIZE } from 'src/app/constants';
import {
  apiCountResponse,
  apiPerDiemRates,
  expectedPerDiemRates,
  apiPerDiemByID,
  allPerDiemRatesParam,
  apiOrgUserSettings,
  expectPerDiemByID,
  allowedPerDiem,
} from '../test-data/per-diem.service.spec.data';
import { of } from 'rxjs';

const fixDate = (data) =>
  data.map((data) => ({
    ...data,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  }));

describe('PerDiemService', () => {
  let perDiemService: PerDiemService;
  let spenderPlatformApiService: jasmine.SpyObj<SpenderPlatformApiService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;

  beforeEach(() => {
    const spenderPlatformApiServiceSpy = jasmine.createSpyObj('SpenderPlatformApiService', ['get']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        PerDiemService,
        {
          provide: SpenderPlatformApiService,
          useValue: spenderPlatformApiServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsServiceSpy,
        },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
      ],
    });
    perDiemService = TestBed.inject(PerDiemService);
    spenderPlatformApiService = TestBed.inject(SpenderPlatformApiService) as jasmine.SpyObj<SpenderPlatformApiService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
  });

  it('should be created', () => {
    expect(perDiemService).toBeTruthy();
  });

  it('should get per-diem rate by ID', (done) => {
    spenderPlatformApiService.get.and.returnValue(of(apiPerDiemByID));
    const actualId = 538;

    const result = perDiemService.getRate(actualId);
    result.subscribe((res) => {
      expect(res).toEqual(expectPerDiemByID);
      done();
    });
  });

  it('should get per diem rates', (done) => {
    spenderPlatformApiService.get.and.returnValue(of(apiCountResponse));
    spenderPlatformApiService.get.and.returnValue(of(apiPerDiemRates));

    const result = perDiemService.getRates();
    result.subscribe((res) => {
      expect(res).toEqual(fixDate(expectedPerDiemRates));
      done();
    });
  });

  it('should get all allowed per diems', (done) => {
    orgUserSettingsService.get.and.returnValue(of(apiOrgUserSettings));

    const result = perDiemService.getAllowedPerDiems(fixDate(allPerDiemRatesParam));

    result.subscribe((res) => {
      expect(res).toEqual(fixDate(allowedPerDiem));
      done();
    });
  });

  it('should return empty list if there are no allowed per diems', (done) => {
    orgUserSettingsService.get.and.returnValue(of(apiOrgUserSettings));

    const result = perDiemService.getAllowedPerDiems(null);

    result.subscribe((res) => {
      expect(res).toEqual([]);
      done();
    });
  });

  it('should return empty list if there is no settings returned', (done) => {
    orgUserSettingsService.get.and.returnValue(of(null));

    const result = perDiemService.getAllowedPerDiems([]);

    result.subscribe((res) => {
      expect(res).toEqual([]);
      done();
    });
  });
});
