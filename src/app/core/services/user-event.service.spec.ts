import { TestBed } from '@angular/core/testing';

import { UserEventService } from './user-event.service';

describe('UserEventService', () => {
  let service: UserEventService;
  let callback: jasmine.Spy;

  beforeEach(() => {
    callback = jasmine.createSpy('callback');
    TestBed.configureTestingModule({
      providers: [UserEventService],
    });
    service = TestBed.inject(UserEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit logoutSubject when calling logout', () => {
    service.onLogout(callback);
    service.logout();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should emit tokenSubject when calling setToken', () => {
    service.onSetToken(callback);
    service.setToken();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should emit taskCacheClearSubject when calling clearTaskCache', () => {
    service.onTaskCacheClear(callback);
    service.clearTaskCache();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should emit internalSubject when calling internalError', () => {
    const data = { message: 'Internal error' };
    service.onInternalError(callback);
    service.internalError(data);
    expect(callback).toHaveBeenCalledOnceWith(data);
  });

  it('should emit outdatedClientSubject when calling outdatedClientError', () => {
    const data = { message: 'Outdated client error' };
    service.onOutdatedClientError(callback);
    service.outdatedClientError(data);
    expect(callback).toHaveBeenCalledOnceWith(data);
  });

  it('should emit clearCacheSubject when calling clearCache', () => {
    service.onClearCache(callback);
    service.clearCache();
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
