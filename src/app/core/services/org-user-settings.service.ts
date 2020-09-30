import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CostCentersService } from './cost-centers.service';
import { finalize, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrgUserSettingsService {
  constructor(
    private apiService: ApiService,
    private costCentersService: CostCentersService
  ) { }

  get() {
    return this.apiService.get('/org_user_settings');
  }


  getAllowedCostCenteres(orgUserSettings) {
    return this.costCentersService.getAllActive().pipe(
      map(
        (costCenters) => {
          let allowedCostCenters = [];
          if (orgUserSettings.cost_center_ids && orgUserSettings.cost_center_ids.length > 0) {
            allowedCostCenters = costCenters.filter((costCenter) => {
              return orgUserSettings.cost_center_ids.indexOf(costCenter.id) > -1;
            });
          } else {
            allowedCostCenters = costCenters;
          }
          return allowedCostCenters;
        }
      )
    );
  }

  getDefaultCostCenter() {
    return forkJoin([this.costCentersService.getAllActive(), this.get()]).pipe(
      map(aggregatedResponse => {
        const [costCenters, settings] = aggregatedResponse;
        const defaultCostCenterId = settings.cost_center_settings && settings.cost_center_settings.default_cost_center_id;
        return costCenters.find(costCenter => costCenter.id === defaultCostCenterId);
      })
    );
  }

  post(data) {
    // Todo: fix timezone issue later
    return this.apiService.post('/org_user_settings', data).pipe(
      finalize(async () => {
        // Todo: Remove cache
      })
    );
  }
}
