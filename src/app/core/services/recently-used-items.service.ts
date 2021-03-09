import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
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

  getRecentCostCenters(costCenters, recentValue):Observable<any> {
    if (costCenters && costCenters.length > 0 && recentValue && recentValue.recent_cost_center_ids && recentValue.recent_cost_center_ids.length > 0) {
      var costCentersMap = {}
      costCenters.forEach(item => {
        costCentersMap[item.value.id] = item;
      })
      return recentValue.recent_cost_center_ids.map(id => costCentersMap[id]);
    } else {
      return of(null);
    }
  }
}