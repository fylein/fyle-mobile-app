import { Injectable } from '@angular/core';
import { Observer, Subject, Subscription } from 'rxjs';

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

  onLogout(callback: () => void): Subscription {
    return this.logoutSubject.subscribe(callback);
  }

  logout(): void {
    return this.logoutSubject.next(null);
  }

  onSetToken(callback: () => void): Subscription {
    return this.tokenSubject.subscribe(callback);
  }

  setToken(): void {
    return this.tokenSubject.next(null);
  }

  clearTaskCache(): void {
    return this.taskCacheClearSubject.next(null);
  }

  onTaskCacheClear(callback: () => void): Subscription {
    return this.taskCacheClearSubject.subscribe(callback);
  }

  onClearCache(callback: () => void): Subscription {
    return this.clearCacheSubject.subscribe(callback);
  }

  clearCache(): void {
    return this.clearCacheSubject.next(null);
  }
}
