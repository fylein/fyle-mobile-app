import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { ApiV2Service } from './api-v2.service';
import { TaxGroups } from '../models/tax_groups.model';

@Injectable({
  providedIn: 'root'
})
export class TaxGroupsService {

  constructor(
    private apiService: ApiService,
    private apiV2Service: ApiV2Service
  ) { }

  get(params: any) {
    let data = {
      params
    };

    return this.apiV2Service.get('/tax_groups', data).pipe(
      map(res => res.data)
    );
  }

  post(tax_group: TaxGroups) {
    /** Only these fields will be of type text & custom fields */
    return this.apiService.post('tax_groups', tax_group);
  }

}
