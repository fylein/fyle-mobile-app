import { Injectable } from '@angular/core';
import { forkJoin, iif, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { OfflineService } from './offline.service';
import { PermissionsService } from './permissions.service';

@Injectable({
  providedIn: 'root',
})
export class SidemenuService {
  constructor(private offlineService: OfflineService, private permissionsService: PermissionsService) {}

  getAllowedActions() {
    return this.offlineService.getOrgSettings().pipe(
      switchMap((orgSettings) => {
        const allowedReportsActions$ = this.offlineService.getReportActions(orgSettings);
        const allowedAdvancesActions$ = this.permissionsService.allowedActions(
          'advances',
          ['approve', 'create', 'delete'],
          orgSettings
        );
        const allowedTripsActions$ = this.permissionsService.allowedActions(
          'trips',
          ['approve', 'create', 'edit', 'cancel'],
          orgSettings
        );

        return forkJoin({
          allowedReportsActions: allowedReportsActions$,
          allowedAdvancesActions: iif(
            () => orgSettings.advance_requests.enabled || orgSettings.advances.enabled,
            allowedAdvancesActions$,
            of(null)
          ),
          allowedTripsActions: iif(() => orgSettings.trip_requests.enabled, allowedTripsActions$, of(null)),
        });
      })
    );
  }
}
