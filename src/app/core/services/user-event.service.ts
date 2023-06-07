import { Injectable } from '@angular/core';
import { Observer, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserEventService {
  destroySubject = new Subject();

  logoutSubject = new Subject();

  internalSubject = new Subject();

  outdatedClientSubject = new Subject();

  clearCacheSubject = new Subject();

  tokenSubject = new Subject();

  taskCacheClearSubject = new Subject();

  constructor() {}

  onLogout(callback: () => void) {
    return this.logoutSubject.subscribe(callback);
  }

  logout() {
    return this.logoutSubject.next(null);
  }

  onSetToken(callback: () => void) {
    return this.tokenSubject.subscribe(callback);
  }

  setToken() {
    return this.tokenSubject.next(null);
  }

  clearTaskCache() {
    return this.taskCacheClearSubject.next(null);
  }

  onTaskCacheClear(callback: () => void) {
    return this.taskCacheClearSubject.subscribe(callback);
  }

  onClearCache(callback: () => void) {
    return this.clearCacheSubject.subscribe(callback);
  }

  clearCache() {
    return this.clearCacheSubject.next(null);
  }
}
