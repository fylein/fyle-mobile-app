import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ExpenseFields } from '../models/V1/expense-fields.model';
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

  getAll(): Observable<ExpenseFields[]> {
    console.log("check if it enters 3")
    return from(this.authService.getEou()).pipe(
      switchMap(eou => {
        console.log("check eou", eou);
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
    console.log("check if it enters 4")
    return this.getAll().pipe(
      map(
        expenseFields => {
          const efMap = {};
          console.log("check expense fields->", expenseFields);

          expenseFields.forEach((expenseField) => {
            efMap[expenseField.column_name] = expenseField;
          });
          console.log("check efmap->", efMap);
          return efMap;
        }
      )
    );
  }
}