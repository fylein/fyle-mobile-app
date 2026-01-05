import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BudgetsService } from './budgets.service';
import { SpenderService } from './spender.service';
import { Budget } from '../../../../models/budget.model';
import { PlatformApiResponse } from '../../../../models/platform/platform-api-response.model';
import {
  budgetData,
  budgetWithProjectsData,
  budgetWithCostCentersData,
  budgetDepartmentsOnlyData,
  budgetCategoriesOnlyData,
  budgetProjectsOnlyData,
  budgetCostCentersOnlyData,
  budgetUnknownTypeData,
} from '../../../../mock-data/platform/v1/budget.data';

describe('BudgetsService', () => {
  let service: BudgetsService;
  let spenderService: jasmine.SpyObj<SpenderService>;

  beforeEach(() => {
    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [{ provide: SpenderService, useValue: spenderServiceSpy }],
    });

    service = TestBed.inject(BudgetsService);
    spenderService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBudgetType():', () => {
    it('should return DEPARTMENT_AND_CATEGORIES when budget has department_ids and category_ids', () => {
      const result = service.getBudgetType(budgetData);
      expect(result).toBe('DEPARTMENT_AND_CATEGORIES');
    });

    it('should return PROJECT_AND_CATEGORIES when budget has project_ids and category_ids', () => {
      const result = service.getBudgetType(budgetWithProjectsData);
      expect(result).toBe('PROJECT_AND_CATEGORIES');
    });

    it('should return COST_CENTER_AND_CATEGORIES when budget has cost_center_ids and category_ids', () => {
      const result = service.getBudgetType(budgetWithCostCentersData);
      expect(result).toBe('COST_CENTER_AND_CATEGORIES');
    });

    it('should return DEPARTMENTS when budget has only department_ids', () => {
      const result = service.getBudgetType(budgetDepartmentsOnlyData);
      expect(result).toBe('DEPARTMENTS');
    });

    it('should return CATEGORIES when budget has only category_ids', () => {
      const result = service.getBudgetType(budgetCategoriesOnlyData);
      expect(result).toBe('CATEGORIES');
    });

    it('should return PROJECTS when budget has only project_ids', () => {
      const result = service.getBudgetType(budgetProjectsOnlyData);
      expect(result).toBe('PROJECTS');
    });

    it('should return COST_CENTERS when budget has only cost_center_ids', () => {
      const result = service.getBudgetType(budgetCostCentersOnlyData);
      expect(result).toBe('COST_CENTERS');
    });

    it('should return UNKNOWN when budget has no ids', () => {
      const result = service.getBudgetType(budgetUnknownTypeData);
      expect(result).toBe('UNKNOWN');
    });
  });

  describe('getSpenderBudgetByParams():', () => {
    it('should fetch budgets with default params and return budgets with budget_type', (done) => {
      const mockResponse: PlatformApiResponse<Budget[]> = {
        data: [budgetData, budgetWithProjectsData],
        count: 2,
        offset: 0,
      };

      spenderService.get.and.returnValue(of(mockResponse));

      const queryParams = { limit: 10 };

      service.getSpenderBudgetByParams(queryParams).subscribe((result) => {
        expect(result.length).toBe(2);
        expect(result[0].budget_type).toBe('DEPARTMENT_AND_CATEGORIES');
        expect(result[1].budget_type).toBe('PROJECT_AND_CATEGORIES');

        expect(spenderService.get).toHaveBeenCalledOnceWith('/budgets', {
          params: {
            offset: 0,
            order: 'name.asc',
            limit: 10,
          },
        });
        done();
      });
    });

    it('should use provided offset and order from queryParams', (done) => {
      const mockResponse: PlatformApiResponse<Budget[]> = {
        data: [budgetData],
        count: 1,
        offset: 10,
      };

      spenderService.get.and.returnValue(of(mockResponse));

      const queryParams = { limit: 5, offset: 10, order: 'updated_at.desc' };

      service.getSpenderBudgetByParams(queryParams).subscribe((result) => {
        expect(result.length).toBe(1);

        expect(spenderService.get).toHaveBeenCalledOnceWith('/budgets', {
          params: {
            offset: 10,
            order: 'updated_at.desc',
            limit: 5,
          },
        });
        done();
      });
    });

    it('should return empty array when API returns null data', (done) => {
      const mockResponse: PlatformApiResponse<Budget[]> = {
        data: null,
        count: 0,
        offset: 0,
      };

      spenderService.get.and.returnValue(of(mockResponse));

      const queryParams = { limit: 10 };

      service.getSpenderBudgetByParams(queryParams).subscribe((result) => {
        expect(result).toEqual([]);
        done();
      });
    });

    it('should handle additional query params like name filter', (done) => {
      const mockResponse: PlatformApiResponse<Budget[]> = {
        data: [budgetData],
        count: 1,
        offset: 0,
      };

      spenderService.get.and.returnValue(of(mockResponse));

      const queryParams = { limit: 10, name: 'ilike.%Marketing%' };

      service.getSpenderBudgetByParams(queryParams).subscribe((result) => {
        expect(result.length).toBe(1);

        expect(spenderService.get).toHaveBeenCalledOnceWith('/budgets', {
          params: {
            offset: 0,
            order: 'name.asc',
            limit: 10,
            name: 'ilike.%Marketing%',
          },
        });
        done();
      });
    });
  });
});
