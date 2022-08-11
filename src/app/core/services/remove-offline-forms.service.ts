import { Injectable } from '@angular/core';
import { from, shareReplay, forkJoin } from 'rxjs';
import { AuthService } from './auth.service';
import { DeviceService } from './device.service';
import { LaunchDarklyService } from './launch-darkly.service';
import { OfflineService } from './offline.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class RemoveOfflineFormsService {
  constructor(
    private launchDarklyService: LaunchDarklyService,
    private authService: AuthService,
    private deviceService: DeviceService,
    private storageService: StorageService,
    private offlineService: OfflineService
  ) {}

  initializeLDUser(eou, deviceInfo, currentOrg) {
    this.launchDarklyService.initializeUser({
      key: eou.ou.user_id,
      custom: {
        org_id: eou.ou.org_id,
        org_user_id: eou.ou.id,
        org_currency: currentOrg?.currency,
        org_created_at: currentOrg?.created_at,
        asset: `MOBILE - ${deviceInfo?.platform.toUpperCase()}`,
      },
    });
  }

  async getRemoveOfflineFormsLDKey() {
    const eou$ = from(this.authService.getEou());
    const currentOrg$ = this.offlineService.getCurrentOrg().pipe(shareReplay(1));
    const deviceInfo$ = this.deviceService.getDeviceInfo().pipe(shareReplay(1));
    await this.storageService.delete('isOfflineFormsRemoved');
    forkJoin([eou$, deviceInfo$, currentOrg$])
      .pipe()
      .subscribe(([eou, deviceInfo, currentOrg]) => {
        this.initializeLDUser(eou, deviceInfo, currentOrg);
        const LDClient = this.launchDarklyService.getLDClient();
        LDClient.waitForInitialization().then(() => {
          const allLDFlags = LDClient.allFlags();
          // eslint-disable-next-line @typescript-eslint/dot-notation
          this.storageService.set('isOfflineFormsRemoved', allLDFlags['remove_offline_forms']);
        });
      });
  }
}
