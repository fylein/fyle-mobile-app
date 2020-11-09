import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExtendedAdvance } from '../models/extended_advance.model';
import { ApiV2Service } from './api-v2.service';


@Injectable({
  providedIn: 'root'
})
export class AdvanceService {

  constructor(
    private apiv2Service: ApiV2Service
  ) { }

  getAdvance(id: string): Observable<ExtendedAdvance> {
    return this.apiv2Service.get('/advances', {
      params: {
        adv_id: `eq.${id}`
      }
    }).pipe(
      map(
        res => this.fixDates(res.data[0]) as ExtendedAdvance
      )
    );
  }

  fixDates(data: ExtendedAdvance) {
    data.adv_created_at = new Date(data.adv_created_at);
    data.adv_issued_at = new Date(data.adv_issued_at);
    if (data.areq_approved_at) {
      data.areq_approved_at = new Date(data.areq_approved_at);
    }
    return data;
  }
}
