import { map, Observable, of, Subject, switchMap } from 'rxjs';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';
import { ApproverService } from './approver.service';
import { Injectable } from '@angular/core';
import { EmployeeSettings } from 'src/app/core/models/employee-settings.model';
import { Cacheable } from 'ts-cacheable';
import { CostCentersService } from 'src/app/core/services/cost-centers.service';
import { CostCenter } from 'src/app/core/models/v1/cost-center.model';

const employeeSettingsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class PlatformEmployeeSettingsService {
  constructor(private approverService: ApproverService, private costCentersService: CostCentersService) {}

  @Cacheable({
    cacheBusterObserver: employeeSettingsCacheBuster$,
  })
  getByEmployeeId(employeeId: string): Observable<EmployeeSettings> {
    return this.approverService
      .get<PlatformApiResponse<EmployeeSettings[]>>('/employee_settings', { params: { employee_id: employeeId } })
      .pipe(map((response) => (response.data.length > 0 ? response.data[0] : null)));
  }

  @Cacheable({
    cacheBusterObserver: employeeSettingsCacheBuster$,
  })
  getAllowedCostCentersByEmployeeId(employeeId: string): Observable<CostCenter[]> {
    return this.getByEmployeeId(employeeId).pipe(
      switchMap((employeeSettings) => {
        if (employeeSettings?.cost_center_ids?.length > 0) {
          return this.costCentersService
            .getAllActive()
            .pipe(
              map((costCenters) =>
                costCenters.filter((costCenter) => employeeSettings.cost_center_ids?.includes(costCenter.id))
              )
            );
        }
        return of([] as CostCenter[]);
      })
    );
  }
}
