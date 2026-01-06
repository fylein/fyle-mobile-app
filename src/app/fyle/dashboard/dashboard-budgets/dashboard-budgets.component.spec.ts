import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ModalController } from '@ionic/angular/standalone';
import { By } from '@angular/platform-browser';
import { DashboardBudgetsComponent } from './dashboard-budgets.component';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';
import { Budget } from 'src/app/core/models/budget.model';
import { BudgetTotalUtilisationInfoModalComponent } from './budget-total-utilisation-info-modal/budget-total-utilisation-info-modal.component';
import { cloneDeep } from 'lodash';

describe('DashboardBudgetsComponent', () => {
  let component: DashboardBudgetsComponent;
  let fixture: ComponentFixture<DashboardBudgetsComponent>;
  let currencyServiceSpy: jasmine.SpyObj<CurrencyService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  const mockBudget: Budget = {
    id: 'budget123',
    org_id: 'org123',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-05T00:00:00.000Z',
    is_enabled: true,
    name: 'Monthly Marketing Budget',
    type: 'MONTHLY',
    amount_limit: 5000,
    alert_threshold: 900,
    department_ids: ['dept1'],
    project_ids: [],
    cost_center_ids: [],
    category_ids: [101],
    observer_ids: ['user1'],
    fiscal_year_start_month: 4,
    budget_start_date: '2025-01-01T00:00:00.000Z',
    budget_end_date: '2025-01-31T23:59:59.000Z',
    budget_creator: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    amount_spent: 1000,
    amount_remaining: 4000,
    utilisation_percentage: 20,
    status: 'ON_TRACK',
  };
  beforeEach(async () => {
    currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    currencyServiceSpy.getHomeCurrency.and.returnValue(of('USD'));
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    await TestBed.configureTestingModule({
      imports: [DashboardBudgetsComponent, getTranslocoTestingModule()],
      providers: [
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardBudgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set homeCurrency from currencyService on construction', () => {
    expect(currencyServiceSpy.getHomeCurrency).toHaveBeenCalledTimes(1);
    expect(component.homeCurrency()).toBe('USD');
  });

  describe('ngOnDestroy():', () => {
    it('should complete the componentDestroyed$ subject', () => {
      spyOn(component['componentDestroyed$'], 'next');
      spyOn(component['componentDestroyed$'], 'complete');
      component.ngOnDestroy();
      expect(component['componentDestroyed$'].next).toHaveBeenCalled();
      expect(component['componentDestroyed$'].complete).toHaveBeenCalled();
    });
  });

  describe('getCurrentBudgetType():', () => {
    it('should return translated monthly for MONTHLY type', () => {
      const budget = { ...mockBudget, type: 'MONTHLY' as const };
      const result = component.getCurrentBudgetType(budget);
      expect(result).toBe('Monthly');
    });

    it('should return translated quarterly for QUARTERLY type', () => {
      const budget = { ...mockBudget, type: 'QUARTERLY' as const };
      const result = component.getCurrentBudgetType(budget);
      expect(result).toBe('Quarterly');
    });

    it('should return translated yearly for YEARLY type', () => {
      const budget = { ...mockBudget, type: 'YEARLY' as const };
      const result = component.getCurrentBudgetType(budget);
      expect(result).toBe('Yearly');
    });

    it('should return translated oneTime for ONE_TIME type', () => {
      const budget = { ...mockBudget, type: 'ONE_TIME' as const };
      const result = component.getCurrentBudgetType(budget);
      expect(result).toBe('One-time');
    });

    it('should return empty string for unknown type', () => {
      const budget = { ...mockBudget, type: 'UNKNOWN_TYPE' as any };
      const result = component.getCurrentBudgetType(budget);
      expect(result).toBe('');
    });
  });

  describe('openTotalUtilisationInfoModal():', () => {
    it('should stop event propagation and create modal', fakeAsync(() => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      const mockModal = {
        present: jasmine.createSpy('present').and.resolveTo(),
      };
      modalControllerSpy.create.and.resolveTo(mockModal as any);
      component.openTotalUtilisationInfoModal(mockEvent);
      tick();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(modalControllerSpy.create).toHaveBeenCalledWith({
        component: BudgetTotalUtilisationInfoModalComponent,
        cssClass: 'budget-total-utilisation-info-modal',
        showBackdrop: true,
        canDismiss: true,
        backdropDismiss: true,
        animated: true,
        handle: false,
      });
      expect(mockModal.present).toHaveBeenCalled();
    }));
  });

  describe('pagination:', () => {
    it('should have dynamicBullets enabled', () => {
      expect(component.pagination.dynamicBullets).toBeTrue();
    });

    it('should render bullet with correct class', () => {
      const bulletHtml = component.pagination.renderBullet(0, 'swiper-pagination-bullet');
      expect(bulletHtml).toContain('dashboard-budgets');
      expect(bulletHtml).toContain('swiper-pagination-bullet');
    });
  });

  describe('template:', () => {
    it('should show shimmer when isLoading is true', () => {
      fixture.componentRef.setInput('isLoading', true);
      fixture.detectChanges();
      const shimmer = fixture.debugElement.query(By.css('[data-testid="shimmer"]'));
      expect(shimmer).toBeTruthy();
    });

    it('should not show shimmer when isLoading is false', () => {
      fixture.componentRef.setInput('isLoading', false);
      fixture.componentRef.setInput('budgets', []);
      fixture.detectChanges();
      const shimmer = fixture.debugElement.query(By.css('[data-testid="shimmer"]'));
      expect(shimmer).toBeFalsy();
    });

    it('should display budgets when budgets array is not empty', () => {
      fixture.componentRef.setInput('isLoading', false);
      fixture.componentRef.setInput('budgets', [mockBudget]);
      fixture.detectChanges();
      const budgetItem = fixture.debugElement.query(By.css('.dashboard-budgets__item'));
      expect(budgetItem).toBeTruthy();
    });

    it('should not display anything when budgets array is empty and not loading', () => {
      fixture.componentRef.setInput('isLoading', false);
      fixture.componentRef.setInput('budgets', []);
      fixture.detectChanges();
      const budgetItem = fixture.debugElement.query(By.css('.dashboard-budgets__item'));
      const shimmer = fixture.debugElement.query(By.css('[data-testid="shimmer"]'));
      expect(budgetItem).toBeFalsy();
      expect(shimmer).toBeFalsy();
    });

    it('should display budget name', () => {
      fixture.componentRef.setInput('isLoading', false);
      fixture.componentRef.setInput('budgets', [mockBudget]);
      fixture.detectChanges();
      const headerContainer = fixture.debugElement.query(By.css('.dashboard-budgets__item-header-container'));
      expect(headerContainer.nativeElement.textContent).toContain('Monthly Marketing Budget');
    });

    it('should show header with budget count when areDashboardTabsEnabled is false', () => {
      fixture.componentRef.setInput('isLoading', false);
      fixture.componentRef.setInput('budgets', [mockBudget]);
      fixture.componentRef.setInput('areDashboardTabsEnabled', false);
      fixture.detectChanges();
      const header = fixture.debugElement.query(By.css('.dashboard-budgets__header'));
      expect(header).toBeTruthy();
      expect(header.nativeElement.textContent).toContain('(1)');
    });

    it('should not show header when areDashboardTabsEnabled is true', () => {
      fixture.componentRef.setInput('isLoading', false);
      fixture.componentRef.setInput('budgets', [mockBudget]);
      fixture.componentRef.setInput('areDashboardTabsEnabled', true);
      fixture.detectChanges();
      const header = fixture.debugElement.query(By.css('.dashboard-budgets__header'));
      expect(header).toBeFalsy();
    });

    it('should apply green class for utilisation <= 50%', () => {
      const lowUtilBudget = cloneDeep(mockBudget);
      lowUtilBudget.utilisation_percentage = 30;
      fixture.componentRef.setInput('isLoading', false);
      fixture.componentRef.setInput('budgets', [lowUtilBudget]);
      fixture.detectChanges();
      const progressBar = fixture.debugElement.query(By.css('.dashboard-budgets__item-utilization-bar-value--green'));
      expect(progressBar).toBeTruthy();
    });

    it('should apply yellow class for utilisation > 50% and < 100%', () => {
      const medUtilBudget = cloneDeep(mockBudget);
      medUtilBudget.utilisation_percentage = 75;
      fixture.componentRef.setInput('isLoading', false);
      fixture.componentRef.setInput('budgets', [medUtilBudget]);
      fixture.detectChanges();
      const progressBar = fixture.debugElement.query(By.css('.dashboard-budgets__item-utilization-bar-value--yellow'));
      expect(progressBar).toBeTruthy();
    });

    it('should apply red class for utilisation >= 100%', () => {
      const highUtilBudget = cloneDeep(mockBudget);
      highUtilBudget.utilisation_percentage = 100;
      fixture.componentRef.setInput('isLoading', false);
      fixture.componentRef.setInput('budgets', [highUtilBudget]);
      fixture.detectChanges();
      const progressBar = fixture.debugElement.query(By.css('.dashboard-budgets__item-utilization-bar-value--red'));
      expect(progressBar).toBeTruthy();
    });

    it('should display currency values when homeCurrency is set', () => {
      fixture.componentRef.setInput('isLoading', false);
      fixture.componentRef.setInput('budgets', [mockBudget]);
      fixture.detectChanges();
      const statValues = fixture.debugElement.queryAll(By.css('.dashboard-budgets__item-info-stat-value'));
      expect(statValues.length).toBeGreaterThan(0);
    });

    it('should display multiple budgets in swiper', () => {
      const budget2 = cloneDeep(mockBudget);
      budget2.id = 'budget456';
      budget2.name = 'Second Budget';
      fixture.componentRef.setInput('isLoading', false);
      fixture.componentRef.setInput('budgets', [mockBudget, budget2]);
      fixture.detectChanges();
      const budgetItems = fixture.debugElement.queryAll(By.css('.dashboard-budgets__item'));
      expect(budgetItems.length).toBe(2);
    });
  });
});
