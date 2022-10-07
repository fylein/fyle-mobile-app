import { Injectable } from '@angular/core';
import { forkJoin, iif, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { OfflineService } from './offline.service';
import { PermissionsService } from './permissions.service';
import { ReportService } from './report.service';

@Injectable({
  providedIn: 'root',
})
export class SidemenuService {
  constructor(
    private offlineService: OfflineService,
    private permissionsService: PermissionsService,
    private reportService: ReportService
  ) {}

  getAllowedActions() {
    return this.offlineService.getOrgSettings().pipe(
      switchMap((orgSettings) => {
        const allowedReportsActions$ = this.reportService.getReportPermissions(orgSettings);
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
