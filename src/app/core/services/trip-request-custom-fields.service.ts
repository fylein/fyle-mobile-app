import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Cacheable } from 'ts-cacheable';

@Injectable({
  providedIn: 'root',
})
export class TripRequestCustomFieldsService {
  constructor(private apiService: ApiService) {}

  sortCustomFieldsByType(customField1, customField2) {
    if (customField1.type > customField2.type) {
      return -1;
    }

    if (customField1.type < customField2.type) {
      return 1;
    }

    return 0;
  }

  filterByRequestTypeAndTripType(customFields, requestType, tripType) {
    return customFields
      .filter((customField) => customField.request_type === requestType && customField.trip_type.indexOf(tripType) > -1)
      .sort(this.sortCustomFieldsByType);
  }

  // @Cacheable()
  getAll() {
    return this.apiService.get('/trip_request_custom_fields');
  }
}
