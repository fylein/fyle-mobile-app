import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { ApiV2Service } from './api-v2.service';
import { TaxGroup } from '../models/tax_group.model';

@Injectable({
  providedIn: 'root',
})
export class TaxGroupService {
  constructor(private apiV2Service: ApiV2Service) {}

  get(params: { is_enabled: string }) {
    const data = {
      params,
    };

    return this.apiV2Service.get('/tax_groups', data).pipe(map((res) => res.data));
  }
}
