import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CostCenter } from '../models/cost-center.model';
import { RecentlyUsed } from '../models/recently_used.model';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class RecentlyUsedItemsService {

  constructor(
    private apiService: ApiService
  ) { }

  getRecentlyUsed():Observable<RecentlyUsed> {
    return this.apiService.get('/recently_used');
  }

  getRecentCostCenters(costCenters, recentValue): Observable<{ label: string, value: CostCenter, selected?: boolean }[]> {
    if (costCenters && costCenters.length > 0 && recentValue && recentValue.recent_cost_center_ids && recentValue.recent_cost_center_ids.length > 0) {
      var costCentersMap = {};
      costCenters.forEach(item => {
        costCentersMap[item.value.id] = item;
      })
      const recentCostCenterList = recentValue.recent_cost_center_ids.map(id => costCentersMap[id]).filter(id => id);
      if (recentCostCenterList) {
        return of(recentCostCenterList.map(costCenter => ({ label: costCenter.value.name, value: costCenter.value })));
      } else {
        return of(null);
      }
    } else {
      return of(null);
    }
  }
}