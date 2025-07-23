import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { IconModule } from '../../icon/icon.module';
import { PersonalCardTransactionComponent } from './personal-card-transaction.component';
import { IonicModule } from '@ionic/angular';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { ExactCurrencyPipe } from '../../pipes/exact-currency.pipe';
import { FyCurrencyPipe } from '../../pipes/fy-currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { platformPersonalCardTxns } from 'src/app/core/mock-data/personal-card-txns.data';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('PersonalCardTransactionComponent', () => {
  let component: PersonalCardTransactionComponent;
  let fixture: ComponentFixture<PersonalCardTransactionComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const dateFormatPipeSpy = jasmine.createSpyObj('DateFormatPipe', ['transform']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    translocoServiceSpy.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'pipes.dateFormat.format': 'MMM DD, YYYY',
        'personalCardTransaction.debit': 'DR',
        'personalCardTransaction.credit': 'CR',
        'personalCardTransaction.createExpense': 'Create expense',
        'personalCardTransaction.viewExpense': 'View expense',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), IconModule, MatIconTestingModule, MatIconModule, TranslocoModule, PersonalCardTransactionComponent, DateFormatPipe, ExactCurrencyPipe, FyCurrencyPipe],
    providers: [
        {
            provide: DateFormatPipe,
            useValue: dateFormatPipeSpy,
        },
        FyCurrencyPipe,
        CurrencyPipe,
        { provide: TranslocoService, useValue: translocoServiceSpy },
    ],
}).compileComponents();

    fixture = TestBed.createComponent(PersonalCardTransactionComponent);
    component = fixture.componentInstance;
    component.transaction = platformPersonalCardTxns.data[0];
    component.selectedElements = [platformPersonalCardTxns.data[0].id, platformPersonalCardTxns.data[1].id];
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('OnInit():', () => {
    it('should set the currency property with a currency symbol in wide format', () => {
      component.currency = 'USD';
      component.ngOnInit();
      expect(component.currency).toEqual('$');
    });

    it('should set the showDt property to true when the transaction dates are different', () => {
      component.previousTxnDate = new Date('1970-01-01T00:00:00.000Z');
      component.ngOnInit();
      expect(component.showDt).toBeTrue();
    });

    it('should set the showDt property to false when the transaction dates are the same', () => {
      component.previousTxnDate = new Date(platformPersonalCardTxns.data[0].spent_at);
      component.ngOnInit();
      expect(component.showDt).toBeFalse();
    });
  });

  it('should set the multi slect mode to true when not enabled', () => {
    const emitSpy = spyOn(component.setMultiselectMode, 'emit');
    component.isSelectionModeEnabled = false;
    component.onSetMultiselectMode();
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('should enable card selection when transaction is tapped', () => {
    const emitSpy = spyOn(component.cardClickedForSelection, 'emit');
    component.isSelectionModeEnabled = true;
    component.onTapTransaction();
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  describe('isSelected():', () => {
    it('should return true when the transaction is selected', () => {
      component.selectAll = true;
      expect(component.isSelected).toBeTrue();
    });

    it('should return false when the transaction is not selected', () => {
      component.transaction = platformPersonalCardTxns.data[2];
      expect(component.isSelected).toBeFalse();
    });
  });

  it('should display the date in the correct format', () => {
    component.showDt = true;
    fixture.detectChanges();
    const dateElement = getElementBySelector(fixture, '.personal-card-transaction--date');
    expect(getTextContent(dateElement)).toEqual('Sep 22, 2024');
  });

  it('should display the "Create expense" button for INITIALIZED status', fakeAsync(() => {
    component.status = 'INITIALIZED';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const buttonElement = getElementBySelector(fixture, '.personal-card-transaction--button') as HTMLButtonElement;
    expect(getTextContent(buttonElement)).toEqual('Create expense');
  }));

  it('should display the "Create expense" button for HIDDEN status', fakeAsync(() => {
    component.status = 'HIDDEN';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const buttonElement = getElementBySelector(fixture, '.personal-card-transaction--button') as HTMLButtonElement;
    expect(getTextContent(buttonElement)).toEqual('Create expense');
  }));

  it('should display the "View expense" button for MATCHED status', fakeAsync(() => {
    component.status = 'MATCHED';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const buttonElement = getElementBySelector(fixture, '.personal-card-transaction--button') as HTMLButtonElement;
    expect(getTextContent(buttonElement)).toEqual('View expense');
  }));

  it('should display the currency, amount, and type', () => {
    component.currency = 'USD';
    fixture.detectChanges();
    const currencyElement = getElementBySelector(fixture, '.personal-card-transaction--currency');
    expect(getTextContent(currencyElement)).toEqual('USD');

    const amountElement = getElementBySelector(fixture, '.personal-card-transaction--amount');
    expect(getTextContent(amountElement)).toEqual('200.00');

    const typeElement = getElementBySelector(fixture, '.personal-card-transaction--type');
    expect(getTextContent(typeElement)).toEqual('DR');
  });

  it('should display the vendor name', () => {
    fixture.detectChanges();
    const vendorElement = getElementBySelector(fixture, '.personal-card-transaction--vendor');
    expect(getTextContent(vendorElement)).toEqual('mocha');
  });
});
