import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, delay } from 'rxjs';
import { LocationService } from './location.service';
import { locationData1, locationData2, locationData4, predictedLocation1 } from '../mock-data/location.data';
import { HttpParams } from '@angular/common/http';

describe('LocationService', () => {
  let locationService: LocationService;
  let httpMock: HttpTestingController;
  const rootUrl = 'https://staging.fyle.tech';

  const requestObj: Record<string, string> = {
    someKey: 'someValue',
  };

  const apiResponse: Record<string, string> = {
    message: 'SUCCESS',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LocationService],
    });

    locationService = TestBed.inject(LocationService);
    httpMock = TestBed.inject(HttpTestingController);
    locationService.setRoot(rootUrl);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(locationService).toBeTruthy();
  });

  it('setRoot(): should set root url', () => {
    expect(locationService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  describe('get():', () => {
    it('should make GET request without params', (done) => {
      locationService.get('/geocode').subscribe((res) => {
        expect(res).toEqual(apiResponse);
        done();
      });

      const req = httpMock.expectOne(`${rootUrl}/location/geocode`);
      expect(req.request.method).toBe('GET');
      req.flush(apiResponse);
    });

    it('should make GET request with params', (done) => {
      locationService
        .get('/geocode', {
          params: requestObj,
        })
        .subscribe((res) => {
          expect(res).toEqual(apiResponse);
          done();
        });

      const req = httpMock.expectOne(`${rootUrl}/location/geocode?someKey=someValue`);
      expect(req.request.method).toBe('GET');
      req.flush(apiResponse);
    });
  });

  describe('timeoutWhen():', () => {
    it('should not apply timeout when condition is false', (done) => {
      const source$ = of('hello');
      const result$ = source$.pipe(locationService.timeoutWhen(false, 5000));

      result$.subscribe({
        next: (value) => {
          expect(value).toBe('hello');
        },
        complete: () => {
          done();
        },
      });
    });

    it('should apply timeout when condition is true', (done) => {
      const source$ = of('hello').pipe(delay(2000)); // emit value after 2 seconds
      const result$ = source$.pipe(locationService.timeoutWhen(true, 1000));

      result$.subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(Error);
          done();
        },
      });
    });
  });

  describe('getGeocode():', () => {
    it('should return location details with display name if displayName is provided', () => {
      const placeId = 'pLcId123';
      const displayName = 'Tollygunge, Kolkata, West Bengal, India';
      const locationDetails = locationData1;
      locationService.getGeocode(placeId, displayName).subscribe((result) => {
        expect(result).toEqual(locationDetails);
      });
      const req = httpMock.expectOne(`${rootUrl}/location/geocode/${placeId}`);
      expect(req.request.body).toBeNull();
      expect(req.request.method).toEqual('GET');
      req.flush(locationDetails);
    });

    it('should not add the displayName to locationDetails when displayName is not provided', () => {
      const placeId = '12345';
      const displayName = '';
      const locationDetails = locationData4;
      locationService.getGeocode(placeId, displayName).subscribe((result) => {
        expect(result).toEqual(locationDetails);
      });
      const req = httpMock.expectOne(`${rootUrl}/location/geocode/${placeId}`);
      expect(req.request.body).toBeNull();
      expect(req.request.method).toEqual('GET');
      req.flush(locationDetails);
    });
  });

  it('getDistance(): should get the distance between locations', () => {
    const fromLocation = locationData1;
    const toLocation = locationData2;
    const expectedDistance = 13167;
    const params = {
      origin_lat: fromLocation.latitude,
      origin_long: fromLocation.longitude,
      destination_lat: toLocation.latitude,
      destination_long: toLocation.longitude,
      mode: 'driving',
    };
    const queryParams = new HttpParams({ fromObject: params });
    locationService.getDistance(fromLocation, toLocation).subscribe((res) => {
      expect(typeof res).toEqual('number');
      expect(res).toEqual(expectedDistance);
    });
    const req = httpMock.expectOne(`${rootUrl}/location/distance?${queryParams}`);
    expect(req.request.method).toEqual('GET');
    expect(req.request.body).toBeNull();
    req.flush(expectedDistance);
  });

  describe('getAutocompletePredictions():', () => {
    it('should autocomplete the predictions without the type param ', () => {
      const text = 'Ben';
      const userId = 'usMjLibmye7s';
      const location = '19.0748,72.8856';
      const params = {
        text,
        user_id: userId,
        location,
      };
      const queryParams = new HttpParams({ fromObject: params });
      locationService.getAutocompletePredictions(text, userId, location).subscribe((res) => {
        expect(typeof res).toEqual('object');
        expect(res).toEqual(predictedLocation1);
      });
      const req = httpMock.expectOne(`${rootUrl}/location/autocomplete?${queryParams}`);
      expect(req.request.method).toEqual('GET');
      expect(req.request.body).toBeNull();
      req.flush({ predictions: predictedLocation1 });
    });

    it('should autocomplete the predictions with the type param ', () => {
      const text = 'Ben';
      const userId = 'usMjLibmye7s';
      const location = '19.0748,72.8856';
      const types = 'DummyType1';
      const params = {
        text,
        user_id: userId,
        location,
        types,
      };
      const queryParams = new HttpParams({ fromObject: params });
      locationService.getAutocompletePredictions(text, userId, location, types).subscribe((res) => {
        expect(typeof res).toEqual('object');
        expect(res).toEqual(predictedLocation1);
      });
      const req = httpMock.expectOne(`${rootUrl}/location/autocomplete?${queryParams}`);
      expect(req.request.method).toEqual('GET');
      expect(req.request.body).toBeNull();
      req.flush({ predictions: predictedLocation1 });
    });
  });
});
