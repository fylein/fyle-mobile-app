import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { ApiV2Service } from './api-v2.service';
import { TaxGroup } from '../models/tax_group.model';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { PlatformTaxGroup } from '../models/platform/platform-tax-group.model';
import { PlatformTaxGroupData } from '../models/platform/platform-tax-group-data.model';

@Injectable({
  providedIn: 'root',
})
export class TaxGroupService {
  constructor(private apiService: ApiService, private spenderPlatformApiService: SpenderPlatformApiService) {}

  transformFrom(platformTaxGroup: PlatformTaxGroupData[]): TaxGroup[] {
    let oldTaxGroup = [];
    oldTaxGroup = platformTaxGroup.map((taxGroup) => ({
      id: taxGroup.id,
      name: taxGroup.name,
      percentage: taxGroup.percentage,
      created_at: taxGroup.created_at,
      updated_at: taxGroup.updated_at,
      org_id: taxGroup.org_id,
      is_enabled: taxGroup.is_enabled,
    }));

    return oldTaxGroup;
  }

  get(params) {
    console.log('check params', params);
    const data = {
      params,
    };

    return this.spenderPlatformApiService
      .get('/tax_groups', data)
      .pipe(map((res: PlatformTaxGroup) => this.transformFrom(res.data)));
  }

  post(taxGroup: TaxGroup) {
    /** Only these fields will be of type text & custom fields */
    return this.apiService.post('tax_groups', taxGroup);
  }
}
