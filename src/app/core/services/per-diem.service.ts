import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Cacheable } from 'ts-cacheable';
import { Subject } from 'rxjs';

const perDiemsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class PerDiemService {
  constructor(private apiService: ApiService) {}

  @Cacheable({
    cacheBusterObserver: perDiemsCacheBuster$,
  })
  getRates() {
    return this.apiService.get('/per_diem_rates');
  }

  getRate(id: number) {
    return this.apiService.get('/per_diem_rates/' + id);
  }
}
