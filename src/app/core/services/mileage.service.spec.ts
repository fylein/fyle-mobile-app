import { TestBed } from '@angular/core/testing';
import { MileageService } from './mileage.service';
import { LocationService } from './location.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { of } from 'rxjs';
import { orgUserSettingsData } from '../mock-data/org-user-settings.data';
import { locationData1, locationData2, locationData3 } from '../mock-data/location.data';

describe('MileageService', () => {
  let mileageService: MileageService;
  let locationService: jasmine.SpyObj<LocationService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;

  const distance = 13167;

  beforeEach(() => {
    const locationServiceSpy = jasmine.createSpyObj('LocationService', ['getDistance']);
    const orgUserSettingsSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        MileageService,
        {
          provide: LocationService,
          useValue: locationServiceSpy,
        },
        {
          provide: OrgUserSettingsService,
          useValue: orgUserSettingsSpy,
        },
      ],
    });

    mileageService = TestBed.inject(MileageService);
    locationService = TestBed.inject(LocationService) as jasmine.SpyObj<LocationService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
  });

  it('should be created', () => {
    expect(mileageService).toBeTruthy();
  });

  it('getOrgUserMileageSettings(): should get user mileage settings', (done) => {
    orgUserSettingsService.get.and.returnValue(of(orgUserSettingsData));

    mileageService.getOrgUserMileageSettings().subscribe((res) => {
      expect(res).toEqual(orgUserSettingsData.mileage_settings);
      expect(orgUserSettingsService.get).toHaveBeenCalledTimes(1);
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
        expect(res).toEqual(null);
        done();
      });
    });

    it('should distance when more than 2 locations are specified', (done) => {
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
