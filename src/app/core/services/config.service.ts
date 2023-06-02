import { Injectable } from '@angular/core';
import { RouterAuthService } from './router-auth.service';
import { SecureStorageService } from './secure-storage.service';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';

@Injectable()
export class ConfigService {
  constructor(
    private routerAuthService: RouterAuthService,
    private tokenService: TokenService,
    private storageService: StorageService,
    private secureStorageService: SecureStorageService
  ) {}

  async loadConfigurationData() {
    const clusterDomain: string = await this.tokenService.getClusterDomain();

    if (clusterDomain) {
      // if clusterdomain is present use that
      await this.routerAuthService.setClusterDomain(clusterDomain);
    } else {
      await this.secureStorageService.clearAll();
      await this.storageService.clearAll();
    }
  }
}
