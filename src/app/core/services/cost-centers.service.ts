import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CostCentersService {

  constructor(
    private apiService: ApiService
  ) { }

  getAllActive() {
    const data = {
      params: {
        active_only: true
      }
    };
    return this.apiService.get('/cost_centers', data);
  }
}
