import { Injectable } from '@angular/core';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { Observable, map } from 'rxjs';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PlatformExpense } from '../models/platform/platform-expense.model';

@Injectable({
  providedIn: 'root',
})
export class PlatformExpenseService {
  constructor(private spenderPlatformV1ApiService: SpenderPlatformV1ApiService) {}

  getExpense(id: string): Observable<PlatformExpense> {
    const data = {
      params: {
        id: `eq.${id}`,
      },
    };

    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformExpense>>('/expenses', data)
      .pipe(map((res) => res.data[0]));
  }
}
