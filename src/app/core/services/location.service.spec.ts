import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, delay } from 'rxjs';
import { LocationService } from './location.service';
import { locationData1 } from '../mock-data/location.data';

describe('LocationService', () => {
  let locationService: LocationService;
  let httpMock: HttpTestingController;
  const rootUrl = 'https://staging.fyle.tech';

  const requestObj = {
    someKey: 'someValue',
  };

  const apiResponse = {
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

  describe('timeoutWhen', () => {
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

  it('should return location details with display name if displayName is provided', () => {
    const placeId = 'pLcId123';
    const displayName = 'Tollygunge, Kolkata, West Bengal, India';
    const locationDetails = locationData1;
    locationService.getGeocode(placeId, displayName).subscribe((result) => {
      expect(result).toEqual({ ...locationDetails, display: displayName });
    });
    const req = httpMock.expectOne(`${rootUrl}/location/geocode/${placeId}`);
    expect(req.request.body).toEqual(null);
    expect(req.request.method).toEqual('GET');
    req.flush(locationDetails);
  });
});
