import { Inject, Injectable } from '@angular/core';
import { RouterAuthService } from './router-auth.service';
import { SecureStorageService } from './secure-storage.service';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';
import { OrgUserSettingsService } from './org-user-settings.service';
import { TIMEZONE } from 'src/app/constants';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable()
export class ConfigService {
  constructor(
    private routerAuthService: RouterAuthService,
    private tokenService: TokenService,
    private storageService: StorageService,
    private secureStorageService: SecureStorageService,
    private orgUserSettingsService: OrgUserSettingsService,
    @Inject(TIMEZONE) private timezone$: BehaviorSubject<string>
  ) {}

  async loadConfigurationData(): Promise<void> {
    const clusterDomain: string = await this.tokenService.getClusterDomain();

    if (clusterDomain) {
      // if clusterdomain is present use that
      await this.routerAuthService.setClusterDomain(clusterDomain);
    } else {
      await this.secureStorageService.clearAll();
      await this.storageService.clearAll();
    }
    const orgUserSettings = await firstValueFrom(this.orgUserSettingsService.get());
    const timezone = orgUserSettings.locale?.timezone;
    this.timezone$.next(timezone || 'UTC');
  }
}
