import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/core';
import { RouterAuthService } from './router-auth.service';
import { TokenService } from './token.service';

@Injectable()
export class ConfigService {
  constructor(private routerAuthService: RouterAuthService, private tokenService: TokenService) {}

  async loadConfigurationData() {
    const clusterDomain = await this.tokenService.getClusterDomain();

    if (clusterDomain) {
      // if clusterdomain is present use that
      await this.routerAuthService.setClusterDomain(clusterDomain);
    }
  }
}
