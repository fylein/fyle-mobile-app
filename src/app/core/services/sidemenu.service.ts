import { Injectable } from '@angular/core';
import { forkJoin, iif, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { OfflineService } from './offline.service';
import { OrgSettingsService } from './org-settings.service';
import { PermissionsService } from './permissions.service';

@Injectable({
  providedIn: 'root',
})
export class SidemenuService {
  constructor(
    private offlineService: OfflineService,
    private permissionsService: PermissionsService,
    private orgSettingsService: OrgSettingsService
  ) {}

  getAllowedActions() {
    return this.orgSettingsService.get().pipe(
      switchMap((orgSettings) => {
        const allowedReportsActions$ = this.offlineService.getReportActions(orgSettings);
        const allowedAdvancesActions$ = this.permissionsService.allowedActions(
          'advances',
          ['approve', 'create', 'delete'],
          orgSettings
        );

        return forkJoin({
          allowedReportsActions: allowedReportsActions$,
          allowedAdvancesActions: iif(
            () => orgSettings.advance_requests.enabled || orgSettings.advances.enabled,
            allowedAdvancesActions$,
            of(null)
          ),
        });
      })
    );
  }
}
