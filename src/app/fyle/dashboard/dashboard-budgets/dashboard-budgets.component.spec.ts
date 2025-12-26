import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { DashboardBudgetsComponent } from './dashboard-budgets.component';
import { CurrencyService } from 'src/app/core/services/currency.service';

describe('DashboardBudgetsComponent', () => {
  let component: DashboardBudgetsComponent;
  let fixture: ComponentFixture<DashboardBudgetsComponent>;
  let currencyServiceSpy: jasmine.SpyObj<CurrencyService>;

  beforeEach(async () => {
    currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    currencyServiceSpy.getHomeCurrency.and.returnValue(of('USD'));

    await TestBed.configureTestingModule({
      imports: [DashboardBudgetsComponent],
      providers: [
        { provide: CurrencyService, useValue: currencyServiceSpy },
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
});
