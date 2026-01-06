import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpenderService } from './spender.service';
import { Budget } from '../../../../models/budget.model';
import { PlatformApiResponse } from '../../../../models/platform/platform-api-response.model';
import { BudgetsQueryParams } from 'src/app/core/models/budgets-query-params.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetsService {
  private spenderService = inject(SpenderService);

  getBudgetType(budget: Budget): string {
    const hasDepartments = budget.department_ids?.length > 0;
    const hasProjects = budget.project_ids?.length > 0;
    const hasCostCenters = budget.cost_center_ids?.length > 0;
    const hasCategories = budget.category_ids?.length > 0;

    const key = `${hasDepartments ? 'D' : ''}${hasProjects ? 'P' : ''}${hasCostCenters ? 'C' : ''}${hasCategories ? 'CAT' : ''}`;

    const typeMap: Record<string, string> = {
      DCAT: 'DEPARTMENT_AND_CATEGORIES',
      PCAT: 'PROJECT_AND_CATEGORIES',
      CCAT: 'COST_CENTER_AND_CATEGORIES',
      D: 'DEPARTMENTS',
      CAT: 'CATEGORIES',
      P: 'PROJECTS',
      C: 'COST_CENTERS',
    };

    return typeMap[key] || 'UNKNOWN';
  }

  getSpenderBudgetByParams(queryParams: BudgetsQueryParams): Observable<Budget[]> {
    const params = {
      offset: 0,
      order: 'name.asc',
      ...queryParams,
    };

    return this.spenderService.get<PlatformApiResponse<Budget[]>>('/budgets', { params }).pipe(
      map((budget) =>
        (budget.data || []).map((budget: Budget) => ({
          ...budget,
          budget_type: this.getBudgetType(budget),
        })),
      ),
    );
  }
}
