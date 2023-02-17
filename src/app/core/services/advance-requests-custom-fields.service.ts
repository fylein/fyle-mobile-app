import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AdvanceRequestsCustomFields } from '../models/advance-requests-custom-fields.model';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdvanceRequestsCustomFieldsService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<AdvanceRequestsCustomFields[]> {
    return this.apiService.get('/advance_request_custom_fields').pipe(
      map((res: AdvanceRequestsCustomFields[]) =>
        res.map((advanceRequestCustomField) => ({
          ...advanceRequestCustomField,
          created_at: new Date(advanceRequestCustomField.created_at),
          updated_at: new Date(advanceRequestCustomField.updated_at),
        }))
      )
    );
  }
}
