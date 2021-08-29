import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AdvanceRequestsCustomFieldsService {
  constructor(private apiService: ApiService) {}

  getAll() {
    return this.apiService.get('/advance_request_custom_fields');
  }
}
