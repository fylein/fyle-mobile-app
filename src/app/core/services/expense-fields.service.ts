import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ExpenseField } from '../models/V1/expense-field.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseFieldsService {

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  getAll(): Observable<ExpenseField[]> {
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        return this.apiService.get('/expense_fields', {
          params: {
            org_id: eou.ou.org_id,
            is_enabled: true
          }
        });
      })
    )
  }

  getAllMap() {
    return this.getAll().pipe(
      map(
        expenseFields => {
          const expenseFieldMap = {};

          expenseFields.forEach(expenseField => {
            expenseFieldMap[expenseField.column_name] = expenseField;
          });

          return expenseFieldMap;
        }
      )
    );
  }
}
