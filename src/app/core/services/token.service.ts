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
  getAccessToken(): Promise<string> {
    return this.secureStorageService.get<string>('X-AUTH-TOKEN');
  }

  @PCacheBuster({
    cacheBusterNotifier: tokenCacheBuster$,
  })
  setAccessToken(accessToken: string): Promise<{ value: boolean }> {
    this.userEventService.setToken();
    return this.secureStorageService.set('X-AUTH-TOKEN', accessToken);
  }

  @PCacheBuster({
    cacheBusterNotifier: tokenCacheBuster$,
  })
  resetAccessToken(): Promise<{ value: boolean }> {
    return this.secureStorageService.delete('X-AUTH-TOKEN');
  }

  getRefreshToken(): Promise<string> {
    return this.secureStorageService.get<string>('X-REFRESH-TOKEN');
  }

  setRefreshToken(refreshToken: string): Promise<{ value: boolean }> {
    return this.secureStorageService.set('X-REFRESH-TOKEN', refreshToken);
  }

  resetRefreshToken(): Promise<{ value: boolean }> {
    return this.secureStorageService.delete('X-REFRESH-TOKEN');
  }

  getClusterDomain(): Promise<string> {
    return this.secureStorageService.get<string>('CLUSTER-DOMAIN');
  }

  setClusterDomain(clusterDomain: string): Promise<{ value: boolean }> {
    return this.secureStorageService.set('CLUSTER-DOMAIN', clusterDomain);
  }

  resetClusterDomain(): Promise<{ value: boolean }> {
    return this.secureStorageService.delete('CLUSTER-DOMAIN');
  }
}
