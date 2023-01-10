import { TestBed } from '@angular/core/testing';
import { PerDiemService } from './per-diem.service';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { PAGINATION_SIZE } from 'src/app/constants';
import {
  expectedPerDiemRates,
  expectedPerDiems,
  apiPerDiemByID,
  allPerDiemRatesParam,
  apiOrgUserSettings,
  expectPerDiemByID,
  allowedPerDiem,
  apiPerDiem,
  apiPerDiemSingleResponse,
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
    perDiemService.getRate(actualId).subscribe((res) => {
      expect(res).toEqual(expectPerDiemByID);
      done();
    });
  });

  it('should get per diem rates', (done) => {
    spenderPlatformApiService.get.and.returnValue(of(apiPerDiemSingleResponse));
    spenderPlatformApiService.get.and.returnValue(of(apiPerDiem));

    const testParams1 = {
      params: {
        is_enabled: 'eq.true',
        offset: 0,
        limit: 1,
      },
    };
    const testParams2 = {
      params: {
        is_enabled: 'eq.true',
        offset: 0,
        limit: 2,
      },
    };

    const testParams3 = {
      params: {
        is_enabled: 'eq.true',
        offset: 2,
        limit: 2,
      },
    };
    perDiemService.getRates().subscribe(() => {
      expect(spenderPlatformApiService.get).toHaveBeenCalledWith('/per_diem_rates', testParams1);
      expect(spenderPlatformApiService.get).toHaveBeenCalledWith('/per_diem_rates', testParams2);
      expect(spenderPlatformApiService.get).toHaveBeenCalledWith('/per_diem_rates', testParams3);
      done();
    });
  });

  it('should get active per-diem count', (done) => {
    spenderPlatformApiService.get.and.returnValue(of(apiPerDiemSingleResponse));

    const params = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };

    perDiemService.getActivePerDiemRatesCount().subscribe((res) => {
      expect(res).toEqual(4);
      expect(spenderPlatformApiService.get).toHaveBeenCalledWith('/per_diem_rates', params);
      done();
    });
  });

  it('should get per diem rates as per config', (done) => {
    spenderPlatformApiService.get.and.returnValue(of(apiPerDiem));

    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 4,
      },
    };

    perDiemService.getPerDiemRates({ offset: 0, limit: 4 }).subscribe((res) => {
      expect(res).toEqual(expectedPerDiems);
      expect(spenderPlatformApiService.get).toHaveBeenCalledWith('/per_diem_rates', data);
      done();
    });
  });

  it('should get all allowed per diems', (done) => {
    orgUserSettingsService.get.and.returnValue(of(apiOrgUserSettings));

    perDiemService.getAllowedPerDiems(fixDate(allPerDiemRatesParam)).subscribe((res) => {
      expect(res).toEqual(fixDate(allowedPerDiem));
      done();
    });
  });

  it('should return empty list if there are no allowed per diems', (done) => {
    orgUserSettingsService.get.and.returnValue(of(apiOrgUserSettings));

    perDiemService.getAllowedPerDiems(null).subscribe((res) => {
      expect(res).toEqual([]);
      done();
    });
  });
});
