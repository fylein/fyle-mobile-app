import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { corporateCardTransaction } from 'src/app/core/models/platform/v1/cc-transaction.model';
import { CardTransactionPreviewComponent } from './card-transaction-preview.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTranslocoTestingModule } from 'src/app/core/testing/transloco-testing.utils';
import { CurrencyPipe } from '@angular/common';

describe('CardTransactionPreviewComponent', () => {
  let component: CardTransactionPreviewComponent;
  let fixture: ComponentFixture<CardTransactionPreviewComponent>;
  let currencyPipe: jasmine.SpyObj<CurrencyPipe>;

  beforeEach(waitForAsync(() => {
    const currencyPipeSpy = jasmine.createSpyObj('CurrencyPipe', ['transform']);
    TestBed.configureTestingModule({
      imports: [
        MatIconTestingModule,
        getTranslocoTestingModule(),
        CardTransactionPreviewComponent,
      ],
      providers: [
        {
          provide: CurrencyPipe,
          useValue: currencyPipeSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CardTransactionPreviewComponent);
    component = fixture.componentInstance;
    currencyPipe = TestBed.inject(CurrencyPipe) as jasmine.SpyObj<CurrencyPipe>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render transaction details', fakeAsync(() => {
    const mockTransactionDetails: Partial<corporateCardTransaction> = {
      merchant: 'Amazon',
      description: 'Amazon purchase',
      spent_at: '2022-02-20',
      amount: 100,
      currency: 'USD',
    };
    currencyPipe.transform.and.returnValue('$100.00');
    component.transactionDetails = mockTransactionDetails;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const header = getElementBySelector(fixture, '.card-transaction--header');
    expect(getTextContent(header)).toBe('Card transaction');

    const merchant = getElementBySelector(fixture, '.card-transaction--matching-content span:nth-child(1)');
    expect(getTextContent(merchant)).toBe('Amazon,');

    const date = getElementBySelector(fixture, '.card-transaction--matching-content span:nth-child(2)');
    expect(getTextContent(date)).toBe('Feb 20, 2022 -');

    const amount = getElementBySelector(fixture, '.card-transaction--matching-content span:nth-child(3)');
    expect(getTextContent(amount)).toBe('$100.00');
  }));

  it('should not render transaction details when transactionDetails is null', () => {
    component.transactionDetails = null;
    fixture.detectChanges();

    const cardTransaction = getElementBySelector(fixture, '.card-transaction');
    expect(cardTransaction).toBeFalsy();
  });
});
