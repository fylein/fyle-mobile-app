import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {Cacheable} from 'ts-cacheable';
import {Subject, Observable} from 'rxjs';
import { PerDiemRate } from '../models/per-diem-rate.model';

const perDiemsCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root'
})
export class PerDiemService {

  constructor(
    private apiService: ApiService
  ) { }

  @Cacheable({
    cacheBusterObserver: perDiemsCacheBuster$
  })
  getRates(): Observable<PerDiemRate[]> {
    return this.apiService.get('/per_diem_rates');
  }

  getRate(id: number): Observable<PerDiemRate> {
    return this.apiService.get('/per_diem_rates/' + id);
  }
}
