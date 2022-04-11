import { Injectable } from '@angular/core';
import { SecureStorageService } from './secure-storage.service';
import { UserEventService } from './user-event.service';
import { PCacheable, PCacheBuster } from 'ts-cacheable';
import { Subject } from 'rxjs';

const tokenCacheBuster$ = new Subject<void>();
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(private secureStorageService: SecureStorageService, private userEventService: UserEventService) {
    this.userEventService.onLogout(() => {
      this.resetRefreshToken();
      this.resetAccessToken();
      this.resetClusterDomain();
    });
  }

  @PCacheable({
    cacheBusterObserver: tokenCacheBuster$,
  })
  getAccessToken() {
    return this.secureStorageService.get('X-AUTH-TOKEN');
  }

  getRefreshToken() {
    return this.secureStorageService.get('X-REFRESH-TOKEN');
  }

  getClusterDomain() {
    return this.secureStorageService.get('CLUSTER-DOMAIN');
  }

  @PCacheBuster({
    cacheBusterNotifier: tokenCacheBuster$,
  })
  setAccessToken(accessToken: string) {
    this.userEventService.setToken();
    return this.secureStorageService.set('X-AUTH-TOKEN', accessToken);
  }

  setRefreshToken(refreshToken: string) {
    return this.secureStorageService.set('X-REFRESH-TOKEN', refreshToken);
  }

  setClusterDomain(clusterDomain: string) {
    return this.secureStorageService.set('CLUSTER-DOMAIN', clusterDomain);
  }

  @PCacheBuster({
    cacheBusterNotifier: tokenCacheBuster$,
  })
  resetAccessToken() {
    return this.secureStorageService.delete('X-AUTH-TOKEN');
  }

  resetRefreshToken() {
    return this.secureStorageService.delete('X-REFRESH-TOKEN');
  }

  resetClusterDomain() {
    return this.secureStorageService.delete('CLUSTER-DOMAIN');
  }
}
