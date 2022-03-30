import { Injectable } from '@angular/core';
import { SecureStorageService } from './secure-storage.service';
import { UserEventService } from './user-event.service';

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

  getAccessToken() {
    return this.secureStorageService.get('X-AUTH-TOKEN');
  }

  getRefreshToken() {
    return this.secureStorageService.get('X-REFRESH-TOKEN');
  }

  setAccessToken(accessToken) {
    this.userEventService.setToken();
    return this.secureStorageService.set('X-AUTH-TOKEN', accessToken);
  }

  setRefreshToken(refreshToken) {
    return this.secureStorageService.set('X-REFRESH-TOKEN', refreshToken);
  }

  setClusterDomain(clusterDomain) {
    return this.secureStorageService.set('CLUSTER-DOMAIN', clusterDomain);
  }

  getClusterDomain() {
    return this.secureStorageService.get('CLUSTER-DOMAIN');
  }

  resetAccessToken() {
    return this.secureStorageService.delete('X-AUTH-TOKEN');
  }

  resetClusterDomain() {
    return this.secureStorageService.delete('CLUSTER-DOMAIN');
  }

  resetRefreshToken() {
    return this.secureStorageService.delete('X-REFRESH-TOKEN');
  }
}
