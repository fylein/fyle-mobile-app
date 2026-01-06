import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ModalController } from '@ionic/angular/standalone';

import { DashboardBudgetsComponent } from './dashboard-budgets.component';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';

describe('DashboardBudgetsComponent', () => {
  let component: DashboardBudgetsComponent;
  let fixture: ComponentFixture<DashboardBudgetsComponent>;
  let currencyServiceSpy: jasmine.SpyObj<CurrencyService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;

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
});
