import { TestBed } from '@angular/core/testing';
import { AdvanceService } from './advance.service';
import {
  singleExtendedAdvancesData,
  extendedAdvWithoutDates,
  extendedAdvWithDates,
} from '../mock-data/extended-advance.data';
import { of } from 'rxjs';
import { SpenderService } from './platform/v1/spender/spender.service';
import { advancePlatform } from '../mock-data/advance-platform.data';
import { cloneDeep } from 'lodash';

describe('AdvanceService', () => {
  let advanceService: AdvanceService;
  let spenderService: jasmine.SpyObj<SpenderService>;

  beforeEach(() => {
    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['get']);
    TestBed.configureTestingModule({
      providers: [
        AdvanceService,
        {
          provide: SpenderService,
          useValue: spenderServiceSpy,
        },
      ],
    });
    advanceService = TestBed.inject(AdvanceService);
    spenderService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
  });

  it('should be created', () => {
    expect(advanceService).toBeTruthy();
  });

  it('getAdvance(): should get an advance from ID', (done) => {
    const id = 'advETmi3eePvQ';
    spenderService.get.and.returnValue(of(advancePlatform));
    // @ts-ignore
    spyOn(advanceService, 'fixDates').and.returnValue(singleExtendedAdvancesData.data[0]);

    advanceService.getAdvance(id).subscribe((res) => {
      expect(res).toEqual(singleExtendedAdvancesData.data[0]);
      expect(spenderService.get).toHaveBeenCalledOnceWith('/advances', {
        params: {
          id: `eq.${id}`,
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
    const mockExtendedAdvData = cloneDeep(extendedAdvWithoutDates);
    //@ts-ignore
    expect(advanceService.fixDates(mockExtendedAdvData)).toEqual(extendedAdvWithDates);
  });

  describe('getSpenderAdvances():', () => {
    it('should return advances', (done) => {
      const config = {
        offset: 0,
        limit: 200,
      };

      spenderService.get.and.returnValue(of(advancePlatform));
      advanceService.getSpenderAdvances(config).subscribe((res) => {
        expect(res).toEqual(singleExtendedAdvancesData);
        expect(spenderService.get).toHaveBeenCalledWith('/advances', {
          params: {
            offset: config.offset,
            limit: config.limit,
          },
        });
      });
      done();
    });

    it('should return advances without queryparams', (done) => {
      const config = {
        offset: 0,
        limit: 200,
        queryParams: {},
      };
      spenderService.get.and.returnValue(of(advancePlatform));
      advanceService.getSpenderAdvances().subscribe((res) => {
        expect(res).toEqual(singleExtendedAdvancesData);
        expect(spenderService.get).toHaveBeenCalledWith('/advances', {
          params: {
            offset: config.offset,
            limit: config.limit,
          },
        });
      });
      done();
    });
  });

  describe('getMyAdvancesCount():', () => {
    it(' should get advances count', (done) => {
      spyOn(advanceService, 'getSpenderAdvances').and.returnValue(of(singleExtendedAdvancesData));
      const queryParams = {
        status: 'ACTIVE',
      };
      advanceService.getMyAdvancesCount(queryParams).subscribe((res) => {
        expect(res).toEqual(singleExtendedAdvancesData.count);
        expect(advanceService.getSpenderAdvances).toHaveBeenCalledOnceWith({
          offset: 0,
          limit: 1,
          queryParams: { ...queryParams },
        });
        done();
      });
    });

    it(' should get advances count without queryparams', (done) => {
      spyOn(advanceService, 'getSpenderAdvances').and.returnValue(of(singleExtendedAdvancesData));
      advanceService.getMyAdvancesCount().subscribe((res) => {
        expect(res).toEqual(singleExtendedAdvancesData.count);
        expect(advanceService.getSpenderAdvances).toHaveBeenCalledOnceWith({
          offset: 0,
          limit: 1,
          queryParams: {},
        });
        done();
      });
    });
  });
});
