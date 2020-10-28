import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CustomInputsService {

  constructor(
    private apiService: ApiService
  ) { }

  getAll(active: boolean) {
    return this.apiService.get('/custom_inputs/custom_properties', { params: { active } });
  }

  filterByCategory(customInputs, orgCategoryId) {
    return customInputs
      .filter(
        customInput => customInput.org_category_ids ?
          customInput.org_category_ids && customInput.org_category_ids.some(id => id === orgCategoryId) : true
      ).sort();
  }
}
