import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule, PopoverController } from '@ionic/angular';

import { TransactionStatusInfoPopoverComponent } from './transaction-status-info-popover.component';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { ExpenseTransactionStatus } from 'src/app/core/enums/platform/v1/expense-transaction-status.enum';
import { of } from 'rxjs';

describe('TransactionStatusInfoComponent', () => {
  let component: TransactionStatusInfoPopoverComponent;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let fixture: ComponentFixture<TransactionStatusInfoPopoverComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), TranslocoModule, TransactionStatusInfoPopoverComponent],
    providers: [
        {
            provide: PopoverController,
            useValue: popoverControllerSpy,
        },
        {
            provide: TranslocoService,
            useValue: translocoServiceSpy,
        },
    ],
}).compileComponents();

    fixture = TestBed.createComponent(TransactionStatusInfoPopoverComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'transactionStatusInfoPopover.title': 'Transaction status:',
        'transactionStatusInfoPopover.pendingStatusInfo':
          "Your transaction status is 'Pending' until your bank processes the transaction.",
        'transactionStatusInfoPopover.postedStatusInfo': 'The transaction has been processed by your bank.',
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

  it('should close the popover when clicked on close button', () => {
    const closeBtn = getElementBySelector(fixture, '[data-testid="close-btn"') as HTMLButtonElement;
    closeBtn.click();

    fixture.detectChanges();

    expect(popoverController.dismiss).toHaveBeenCalled();
  });

  describe('template', () => {
    describe('title', () => {
      it('should display the correct title when transaction status is PENDING', () => {
        fixture.componentRef.setInput('transactionStatus', ExpenseTransactionStatus.PENDING);

        fixture.detectChanges();

        const title = getElementBySelector(fixture, '[data-testid="title"');
        expect(title.textContent).toEqual('Transaction status: Pending');
      });

      it('should display the correct title when transaction status is POSTED', () => {
        fixture.componentRef.setInput('transactionStatus', ExpenseTransactionStatus.POSTED);

        fixture.detectChanges();

        const title = getElementBySelector(fixture, '[data-testid="title"');
        expect(title.textContent).toEqual('Transaction status: Posted');
      });
    });

    describe('content', () => {
      it('should display the correct content when transaction status is PENDING', fakeAsync(() => {
        fixture.componentRef.setInput('transactionStatus', ExpenseTransactionStatus.PENDING);

        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const content = getElementBySelector(fixture, '[data-testid="content"');
        expect(content.textContent).toEqual(
          `Your transaction status is 'Pending' until your bank processes the transaction.`,
        );
      }));

      it('should display the correct content when transaction status is POSTED', () => {
        fixture.componentRef.setInput('transactionStatus', ExpenseTransactionStatus.POSTED);

        fixture.detectChanges();

        const content = getElementBySelector(fixture, '[data-testid="content"');
        expect(content.textContent).toEqual('The transaction has been processed by your bank.');
      });
    });
  });
});
