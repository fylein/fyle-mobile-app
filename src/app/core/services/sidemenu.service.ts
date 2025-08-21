import { Injectable, inject } from '@angular/core';
import { forkJoin, iif, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SidemenuAllowedActions } from '../models/sidemenu-allowed-actions.model';
import { OrgSettingsService } from './org-settings.service';
import { PermissionsService } from './permissions.service';
import { ReportService } from './report.service';

@Injectable({
  providedIn: 'root',
})
export class SidemenuService {
  private permissionsService = inject(PermissionsService);

  private reportService = inject(ReportService);

  private orgSettingsService = inject(OrgSettingsService);

  getAllowedActions(): Observable<SidemenuAllowedActions> {
    return this.orgSettingsService.get().pipe(
      switchMap((orgSettings) => {
        const allowedReportsActions$ = this.reportService.getReportPermissions(orgSettings);
        const allowedAdvancesActions$ = this.permissionsService.allowedActions(
          'advances',
          ['approve', 'create', 'delete'],
          orgSettings,
        );

        return forkJoin({
          allowedReportsActions: allowedReportsActions$,
          allowedAdvancesActions: iif(
            () => orgSettings.advance_requests.enabled || orgSettings.advances.enabled,
            allowedAdvancesActions$,
            of(null),
          ),
        });
      }),
    );
  }
}
