import { TestBed } from '@angular/core/testing';

import { UserEventService } from './user-event.service';

describe('UserEventService', () => {
  let userEventService: UserEventService;
  let callback: jasmine.Spy;

  beforeEach(() => {
    callback = jasmine.createSpy('callback');
    TestBed.configureTestingModule({
      providers: [UserEventService],
    });
    userEventService = TestBed.inject(UserEventService);
  });

  it('should be created', () => {
    expect(userEventService).toBeTruthy();
  });

  it('should emit logoutSubject when calling logout', () => {
    userEventService.onLogout(callback);
    userEventService.logout();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should emit tokenSubject when calling setToken', () => {
    userEventService.onSetToken(callback);
    userEventService.setToken();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should emit taskCacheClearSubject when calling clearTaskCache', () => {
    userEventService.onTaskCacheClear(callback);
    userEventService.clearTaskCache();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should emit clearCacheSubject when calling clearCache', () => {
    userEventService.onClearCache(callback);
    userEventService.clearCache();
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
