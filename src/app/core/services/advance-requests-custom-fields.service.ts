import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AdvanceRequestsCustomFields } from '../models/advance-requests-custom-fields.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdvanceRequestsCustomFieldsService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<AdvanceRequestsCustomFields[]> {
    return this.apiService.get('/advance_request_custom_fields');
  }
}
