import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Cacheable } from 'ts-cacheable';
import { Subject } from 'rxjs';

const costCentersCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CostCentersService {
  constructor(private apiService: ApiService) {}

  @Cacheable({
    cacheBusterObserver: costCentersCacheBuster$,
  })
  getAllActive() {
    const data = {
      params: {
        active_only: true,
      },
    };
    return this.apiService.get('/cost_centers', data);
  }
}
