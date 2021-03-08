import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Cacheable } from 'ts-cacheable';
import { Subject, Observable } from 'rxjs';
import {CostCenter} from '../models/cost-center.model';

const costCentersCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root'
})
export class CostCentersService {

  constructor(
    private apiService: ApiService
  ) { }

  @Cacheable({
    cacheBusterObserver: costCentersCacheBuster$
  })
  getAllActive(): Observable<CostCenter[]> {
    const data = {
      params: {
        active_only: true
      }
    };
    return this.apiService.get('/cost_centers', data);
  }
}
