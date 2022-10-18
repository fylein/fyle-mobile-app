import { Injectable } from '@angular/core';
import { forkJoin, iif, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { OrgSettingsService } from './org-settings.service';
import { PermissionsService } from './permissions.service';
import { ReportService } from './report.service';

@Injectable({
  providedIn: 'root',
})
export class SidemenuService {
  constructor(
    private permissionsService: PermissionsService,
    private reportService: ReportService,
    private orgSettingsService: OrgSettingsService
  ) {}

  getAllowedActions() {
    return this.orgSettingsService.get().pipe(
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
