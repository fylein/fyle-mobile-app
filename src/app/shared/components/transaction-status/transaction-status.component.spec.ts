import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TransactionStatusComponent } from './transaction-status.component';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';

describe('TransactionStatusComponent', () => {
  let component: TransactionStatusComponent;
  let fixture: ComponentFixture<TransactionStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionStatusComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionStatusComponent);
    component = fixture.componentInstance;
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
