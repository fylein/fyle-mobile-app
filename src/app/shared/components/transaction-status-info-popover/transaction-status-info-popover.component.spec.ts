import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';

import { TransactionStatusInfoPopoverComponent } from './transaction-status-info-popover.component';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';

describe('TransactionStatusInfoComponent', () => {
  let component: TransactionStatusInfoPopoverComponent;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let fixture: ComponentFixture<TransactionStatusInfoPopoverComponent>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [TransactionStatusInfoPopoverComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionStatusInfoPopoverComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the popover when clicked on close button', () => {
    const closeBtn = getElementBySelector(fixture, '[data-testid="close-btn"') as HTMLButtonElement;
    closeBtn.click();

    fixture.detectChanges();

    expect(popoverController.dismiss).toHaveBeenCalled();
  });

  it('should return ExpenseTransactionStatus enum from TransactionStatus getter', () => {
    expect(component.TransactionStatus).toBe(ExpenseTransactionStatus);
  });

  describe('template', () => {
    describe('title', () => {
      it('should display the correct title when transaction status is PENDING', () => {
        component.transactionStatus = ExpenseTransactionStatus.PENDING;

        fixture.detectChanges();

        const title = getElementBySelector(fixture, '[data-testid="title"');
        expect(title.textContent).toEqual('Transaction status: Pending');
      });

      it('should display the correct title when transaction status is POSTED', () => {
        component.transactionStatus = ExpenseTransactionStatus.POSTED;

        fixture.detectChanges();

        const title = getElementBySelector(fixture, '[data-testid="title"');
        expect(title.textContent).toEqual('Transaction status: Posted');
      });
    });

    describe('content', () => {
      it('should display the correct content when transaction status is PENDING', () => {
        component.transactionStatus = ExpenseTransactionStatus.PENDING;

        fixture.detectChanges();

        const content = getElementBySelector(fixture, '[data-testid="content"');
        expect(content.textContent).toEqual(
          `Your transaction status is 'Pending' until your bank processes the transaction.`
        );
      });

      it('should display the correct content when transaction status is POSTED', () => {
        component.transactionStatus = ExpenseTransactionStatus.POSTED;

        fixture.detectChanges();

        const content = getElementBySelector(fixture, '[data-testid="content"');
        expect(content.textContent).toEqual('The transaction has been processed by your bank.');
      });
    });
  });
});
