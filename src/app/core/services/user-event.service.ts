import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

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

  onLogout(callback) {
    return this.logoutSubject.subscribe(callback);
  }

  logout() {
    return this.logoutSubject.next(null);
  }

  onSetToken(callback) {
    return this.tokenSubject.subscribe(callback);
  }

  setToken() {
    return this.tokenSubject.next(null);
  }

  clearTaskCache() {
    return this.taskCacheClearSubject.next(null);
  }

  onTaskCacheClear(callback) {
    return this.taskCacheClearSubject.subscribe(callback);
  }

  onInternalError(callback) {
    return this.internalSubject.subscribe(callback);
  }

  onOutdatedClientError(callback) {
    return this.outdatedClientSubject.subscribe(callback);
  }

  internalError(data) {
    return this.internalSubject.next(data);
  }

  outdatedClientError(data) {
    return this.outdatedClientSubject.next(data);
  }

  onClearCache(callback) {
    return this.clearCacheSubject.subscribe(callback);
  }

  clearCache() {
    return this.clearCacheSubject.next(null);
  }
}
