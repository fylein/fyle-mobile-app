import { TestBed } from '@angular/core/testing';
import { Capacitor } from '@capacitor/core';
import { DeviceService } from './device.service';

describe('DeviceService', () => {
  let service: DeviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAppInfo():', () => {
    it('should return observable with web version when on web platform', (done) => {
      spyOn(Capacitor, 'getPlatform').and.returnValue('web');

      const result = service.getAppInfo();
      if ('subscribe' in result) {
        result.subscribe((appInfo) => {
          expect(appInfo.version).toBe('1.2.3');
          done();
        });
      } else {
        fail('Expected observable on web platform');
      }
    });
  });
});
