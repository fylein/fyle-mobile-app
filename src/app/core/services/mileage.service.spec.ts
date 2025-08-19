import { TestBed } from '@angular/core/testing';
import { MileageService } from './mileage.service';
import { LocationService } from './location.service';
import { PlatformEmployeeSettingsService } from './platform/v1/spender/employee-settings.service';
import { of } from 'rxjs';
import { locationData1, locationData2, locationData3 } from '../mock-data/location.data';
import { employeeSettingsData } from '../mock-data/employee-settings.data';
import { TranslocoService } from '@jsverse/transloco';

describe('MileageService', () => {
  let mileageService: MileageService;
  let locationService: jasmine.SpyObj<LocationService>;
  let platformEmployeeSettingsService: jasmine.SpyObj<PlatformEmployeeSettingsService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  const distance = 13167;

  beforeEach(() => {
    const locationServiceSpy = jasmine.createSpyObj('LocationService', ['getDistance']);
    const platformEmployeeSettingsSpy = jasmine.createSpyObj('PlatformEmployeeSettingsService', ['get']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'services.mileage.oneWayDistance': 'One way distance',
        'services.mileage.roundTripDistance': 'Round trip distance',
        'services.mileage.noDeduction': 'No deduction',
      };
      return translations[key] || key;
    });

    TestBed.configureTestingModule({
      providers: [
        MileageService,
        {
          provide: LocationService,
          useValue: locationServiceSpy,
        },
        {
          provide: PlatformEmployeeSettingsService,
          useValue: platformEmployeeSettingsSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });

    mileageService = TestBed.inject(MileageService);
    locationService = TestBed.inject(LocationService) as jasmine.SpyObj<LocationService>;
    platformEmployeeSettingsService = TestBed.inject(
      PlatformEmployeeSettingsService,
    ) as jasmine.SpyObj<PlatformEmployeeSettingsService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(mileageService).toBeTruthy();
  });

  it('getEmployeeMileageSettings(): should get user mileage settings', (done) => {
    platformEmployeeSettingsService.get.and.returnValue(of(employeeSettingsData));

    mileageService.getEmployeeMileageSettings().subscribe((res) => {
      expect(res).toEqual(employeeSettingsData.mileage_settings);
      expect(platformEmployeeSettingsService.get).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('getDistanceInternal(): should get internal distance between two locations', (done) => {
    locationService.getDistance.and.returnValue(of(distance));

    mileageService.getDistanceInternal(locationData1, locationData2).subscribe((res) => {
      expect(res).toEqual(distance);
      expect(locationService.getDistance).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('getDistance():', () => {
    it('should get the distance between two locations', (done) => {
      spyOn(mileageService, 'getDistanceInternal').and.returnValue(of(distance));
      mileageService.getDistance([locationData1, locationData2]).subscribe((res) => {
        expect(res).toEqual(distance);
        expect(mileageService.getDistanceInternal).toHaveBeenCalledOnceWith(locationData1, locationData2);
        done();
      });
    });

    it('should return null when no locations are specified', (done) => {
      mileageService.getDistance().subscribe((res) => {
        expect(res).toBeNull();
        done();
      });
    });

    it('should return the distance when more than 2 locations are specified', (done) => {
      const dist2 = 7798;
      const dist1 = 6404;
      const getDistanceInternal = spyOn(mileageService, 'getDistanceInternal');
      getDistanceInternal.withArgs(locationData1, locationData3).and.returnValue(of(dist1));
      getDistanceInternal.withArgs(locationData3, locationData2).and.returnValue(of(dist2));

      mileageService.getDistance([locationData1, locationData3, locationData2]).subscribe((res) => {
        expect(res).toEqual(dist1 + dist2);
        expect(getDistanceInternal).toHaveBeenCalledWith(locationData1, locationData3);
        expect(getDistanceInternal).toHaveBeenCalledWith(locationData3, locationData2);
        expect(getDistanceInternal).toHaveBeenCalledTimes(2);
        done();
      });
    });
  });

  it('getChunks(): should divide a journey of multiple locations in pairs', () => {
    const locations = [locationData1, locationData3, locationData2];
    const chunks = [];
    const expectedChunks = [
      [locationData1, locationData3],
      [locationData3, locationData2],
    ];

    // @ts-ignore
    mileageService.getChunks(locations, chunks);
    expect(chunks).toEqual(expectedChunks);
  });
});
