import { TestBed } from '@angular/core/testing';

import { PerfTrackers } from '../models/perf-trackers.enum';
import { TrackingService } from './tracking.service';

xdescribe('TrackingService', () => {
  let service: TrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('trackAppLaunchTimeIfFirstScreen()', () => {
    it('should measure and track app launch time when start mark exists and measure does not', () => {
      const performanceStub = {
        mark: jasmine.createSpy('mark'),
        measure: jasmine.createSpy('measure'),
        getEntriesByName: jasmine
          .createSpy('getEntriesByName')
          .and.returnValues([], [{ detail: true }], [{ duration: 5000 }], [{ detail: true }]),
      };
      Object.defineProperty(window, 'performance', { value: performanceStub });
      spyOn(service, 'appLaunchTime').and.stub();

      service.trackAppLaunchTimeIfFirstScreen();

      expect(performanceStub.mark).toHaveBeenCalledOnceWith(PerfTrackers.appLaunchEndTime);
      expect(performanceStub.measure).toHaveBeenCalledOnceWith(
        PerfTrackers.appLaunchTime,
        PerfTrackers.appLaunchStartTime,
        PerfTrackers.appLaunchEndTime,
      );
      expect(service.appLaunchTime).toHaveBeenCalledOnceWith({
        'App launch time': '5.000',
        'Is logged in': true,
      });
    });

    it('should do nothing when appLaunchTime measure already exists', () => {
      const performanceStub = {
        mark: jasmine.createSpy('mark'),
        measure: jasmine.createSpy('measure'),
        getEntriesByName: jasmine.createSpy('getEntriesByName').and.returnValue([{}]),
      };
      Object.defineProperty(window, 'performance', { value: performanceStub });
      spyOn(service, 'appLaunchTime').and.stub();

      service.trackAppLaunchTimeIfFirstScreen();

      expect(performanceStub.mark).not.toHaveBeenCalled();
      expect(performanceStub.measure).not.toHaveBeenCalled();
      expect(service.appLaunchTime).not.toHaveBeenCalled();
    });

    it('should do nothing when appLaunchStartTime mark does not exist', () => {
      const performanceStub = {
        mark: jasmine.createSpy('mark'),
        measure: jasmine.createSpy('measure'),
        getEntriesByName: jasmine.createSpy('getEntriesByName').and.returnValue([]),
      };
      Object.defineProperty(window, 'performance', { value: performanceStub });
      spyOn(service, 'appLaunchTime').and.stub();

      service.trackAppLaunchTimeIfFirstScreen();

      expect(performanceStub.mark).not.toHaveBeenCalled();
      expect(performanceStub.measure).not.toHaveBeenCalled();
      expect(service.appLaunchTime).not.toHaveBeenCalled();
    });
  });
});
