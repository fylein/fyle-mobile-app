import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { ApiV2Service } from './api-v2.service';
import { TaxGroup } from '../models/tax_group.model';

@Injectable({
  providedIn: 'root',
})
export class TaxGroupService {
  constructor(private apiService: ApiService, private apiV2Service: ApiV2Service) {}

  get(params) {
    const data = {
      params,
    };

    return this.apiV2Service.get('/tax_groups', data).pipe(map((res) => res.data));
  }

  post(taxGroup: TaxGroup) {
    /** Only these fields will be of type text & custom fields */
    return this.apiService.post('tax_groups', taxGroup);
  }
}
