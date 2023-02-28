import { TestBed } from '@angular/core/testing';
import { ApiV2Service } from './api-v2.service';
import { AuthService } from './auth.service';
import { AdvanceService } from './advance.service';
import {
  singleExtendedAdvancesData,
  extendedAdvWithoutDates,
  extendedAdvWithDates,
} from '../mock-data/extended-advance.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { of } from 'rxjs';

describe('AdvanceService', () => {
  let advanceService: AdvanceService;
  let apiv2Service: jasmine.SpyObj<ApiV2Service>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const apiv2ServiceSpy = jasmine.createSpyObj('ApiV2Service', ['get']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    TestBed.configureTestingModule({
      providers: [
        AdvanceService,
        {
          provide: ApiV2Service,
          useValue: apiv2ServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
      ],
    });
    advanceService = TestBed.inject(AdvanceService);
    apiv2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(advanceService).toBeTruthy();
  });

  it('getAdvance(): should get an advance from ID', (done) => {
    const id = 'advETmi3eePvQ';
    apiv2Service.get.and.returnValue(of(singleExtendedAdvancesData));
    // @ts-ignore
    spyOn(advanceService, 'fixDates').and.returnValue(singleExtendedAdvancesData.data[0]);

    advanceService.getAdvance(id).subscribe((res) => {
      expect(res).toEqual(singleExtendedAdvancesData.data[0]);
      expect(apiv2Service.get).toHaveBeenCalledOnceWith('/advances', {
        params: {
          adv_id: `eq.${id}`,
        },
      });
      // @ts-ignore
      expect(advanceService.fixDates).toHaveBeenCalledOnceWith(singleExtendedAdvancesData.data[0]);
      done();
    });
  });

  it('destroyAdvancesCacheBuster(): should destroy advances cache buster', () => {
    advanceService.destroyAdvancesCacheBuster().subscribe((result) => {
      expect(result).toBeNull();
    });
  });

  it('fixDates(): should convert string values to dates', () => {
    //@ts-ignore
    expect(advanceService.fixDates(extendedAdvWithoutDates)).toEqual(extendedAdvWithDates);
  });

  describe('getMyadvances():', () => {
    it('should return advances', (done) => {
      const config = {
        offset: 0,
        limit: 10,
        queryParams: { status: 'ACTIVE' },
      };

      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      apiv2Service.get.and.returnValue(of(singleExtendedAdvancesData));
      advanceService.getMyadvances(config).subscribe((res) => {
        expect(res).toEqual(singleExtendedAdvancesData);
        expect(apiv2Service.get).toHaveBeenCalledWith('/advances', {
          params: {
            offset: config.offset,
            limit: config.limit,
            assignee_ou_id: 'eq.' + apiEouRes.ou.id,
            ...config.queryParams,
          },
        });
        expect(authService.getEou).toHaveBeenCalledTimes(1);
      });
      done();
    });

    it('should return advances without queryparams', (done) => {
      const config = {
        offset: 0,
        limit: 10,
        queryParams: {},
      };

      authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
      apiv2Service.get.and.returnValue(of(singleExtendedAdvancesData));
      advanceService.getMyadvances().subscribe((res) => {
        expect(res).toEqual(singleExtendedAdvancesData);
        expect(apiv2Service.get).toHaveBeenCalledWith('/advances', {
          params: {
            offset: config.offset,
            limit: config.limit,
            assignee_ou_id: 'eq.' + apiEouRes.ou.id,
          },
        });
        expect(authService.getEou).toHaveBeenCalledTimes(1);
      });
      done();
    });
  });

  describe('getMyAdvancesCount():', () => {
    it(' should get advances count', (done) => {
      spyOn(advanceService, 'getMyadvances').and.returnValue(of(singleExtendedAdvancesData));
      const queryParams = {
        status: 'ACTIVE',
      };
      advanceService.getMyAdvancesCount(queryParams).subscribe((res) => {
        expect(res).toEqual(singleExtendedAdvancesData.count);
        expect(advanceService.getMyadvances).toHaveBeenCalledOnceWith({
          offset: 0,
          limit: 1,
          queryParams: { ...queryParams },
        });
        done();
      });
    });

    it(' should get advances count without queryparams', (done) => {
      spyOn(advanceService, 'getMyadvances').and.returnValue(of(singleExtendedAdvancesData));
      advanceService.getMyAdvancesCount().subscribe((res) => {
        expect(res).toEqual(singleExtendedAdvancesData.count);
        expect(advanceService.getMyadvances).toHaveBeenCalledOnceWith({
          offset: 0,
          limit: 1,
          queryParams: {},
        });
        done();
      });
    });
  });
});
