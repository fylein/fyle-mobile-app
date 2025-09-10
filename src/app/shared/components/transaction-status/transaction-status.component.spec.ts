import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';

import { TransactionStatusComponent } from './transaction-status.component';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { of } from 'rxjs';

describe('TransactionStatusComponent', () => {
  let component: TransactionStatusComponent;
  let fixture: ComponentFixture<TransactionStatusComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TranslocoModule, TransactionStatusComponent],
      providers: [{ provide: TranslocoService, useValue: translocoServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionStatusComponent);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'transactionStatus.statusLabel': 'Transaction status:',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the statusClick event when clicked on the info icon', () => {
    spyOn(component.statusClick, 'emit');

    const infoIcon = getElementBySelector(fixture, '[data-testid="info-icon"]') as HTMLButtonElement;
    infoIcon.click();

    expect(component.statusClick.emit).toHaveBeenCalledTimes(1);
  });

  describe('template', () => {
    it('should display the transaction status value properly when pending', () => {
      component.transactionStatus = ExpenseTransactionStatus.PENDING;

      fixture.detectChanges();

      const statusValue = getElementBySelector(fixture, '[data-testid="status-value"]');
      expect(statusValue.textContent).toEqual('Pending');
    });

    it('should display the transaction status value properly when posted', () => {
      component.transactionStatus = ExpenseTransactionStatus.POSTED;

      fixture.detectChanges();

      const statusValue = getElementBySelector(fixture, '[data-testid="status-value"]');
      expect(statusValue.textContent).toEqual('Posted');
    });
  });
});
