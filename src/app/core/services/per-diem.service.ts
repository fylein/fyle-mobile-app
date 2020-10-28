import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PerDiemService {

  constructor(
    private apiService: ApiService
  ) { }

  getRates() {
    return this.apiService.get('/per_diem_rates');
  }

  getRate(id: number) {
    return this.apiService.get('/per_diem_rates/' + id);
  };
}
