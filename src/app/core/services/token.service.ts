import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(
    private storageService: StorageService
  ) {
    // UserEventService.onLogout(function () {
    //   self.resetRefreshToken();
    //   self.resetAccessToken();
    //   self.resetClusterDomain();
    // });
  }

  getAccessToken() {
    return this.storageService.get('X-AUTH-TOKEN');
  }

  getRefreshToken() {
    return this.storageService.get('X-REFRESH-TOKEN');
  }

  setAccessToken(accessToken) {
    return this.storageService.set('X-AUTH-TOKEN', accessToken);
  }

  setRefreshToken(refreshToken) {
    return this.storageService.set('X-REFRESH-TOKEN', refreshToken);
  }

  setClusterDomain(clusterDomain) {
    return this.storageService.set('CLUSTER-DOMAIN', clusterDomain);
  }

  getClusterDomain() {
    return this.storageService.get('CLUSTER-DOMAIN');
  }

  resetAccessToken() {
    return this.storageService.delete('X-AUTH-TOKEN');
  }

  resetClusterDomain() {
    return this.storageService.delete('CLUSTER-DOMAIN');
  }

  resetRefreshToken() {
    return this.storageService.delete('X-REFRESH-TOKEN');
  }
}
