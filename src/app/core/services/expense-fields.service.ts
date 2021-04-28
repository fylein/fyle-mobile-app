import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ExpenseField } from '../models/V1/expense-field.model';
import { ExpenseFieldsMap } from '../models/V1/expense-fields-map.model';
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

  getAllMap(): Observable<ExpenseFieldsMap> {
    return this.getAll().pipe(
      map(
        expenseFields => {
          const expenseFieldMap: ExpenseFieldsMap = {};

          expenseFields.forEach(expenseField => {
            if (expenseFieldMap[expenseField.column_name]) {
              let expenseFieldsList = expenseFieldMap[expenseField.column_name];
              expenseFieldsList.push(expenseField);
              expenseFieldMap[expenseField.column_name] = expenseFieldsList;
            } else {
              let newExpenseFieldList = [];
              newExpenseFieldList.push(expenseField);
              expenseFieldMap[expenseField.column_name] = newExpenseFieldList;
            }
          });

          return expenseFieldMap;
        }
      )
    );
  }
}
