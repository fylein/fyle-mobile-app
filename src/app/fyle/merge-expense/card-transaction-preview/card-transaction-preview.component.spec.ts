import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IonicModule } from '@ionic/angular';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { corporateCardTransaction } from 'src/app/core/models/platform/v1/cc-transaction.model';
import { EllipsisPipe } from 'src/app/shared/pipes/ellipses.pipe';

import { CardTransactionPreviewComponent } from './card-transaction-preview.component';

describe('CardTransactionPreviewComponent', () => {
  let component: CardTransactionPreviewComponent;
  let fixture: ComponentFixture<CardTransactionPreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CardTransactionPreviewComponent, EllipsisPipe],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CardTransactionPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render transaction details', () => {
    const mockTransactionDetails: Partial<corporateCardTransaction> = {
      merchant: 'Amazon',
      description: 'Amazon purchase',
      spent_at: '2022-02-20',
      amount: 100,
      currency: 'USD',
    };
    component.transactionDetails = mockTransactionDetails;
    fixture.detectChanges();

    const header = getElementBySelector(fixture, '.card-transaction--header');
    expect(getTextContent(header)).toBe('Card transaction');

    const merchant = getElementBySelector(fixture, '.card-transaction--matching-content span:nth-child(1)');
    expect(getTextContent(merchant)).toBe('Amazon,');

    const date = getElementBySelector(fixture, '.card-transaction--matching-content span:nth-child(2)');
    expect(getTextContent(date)).toBe('Feb 20, 2022 -');

    const amount = getElementBySelector(fixture, '.card-transaction--matching-content span:nth-child(3)');
    expect(getTextContent(amount)).toBe('$100.00');
  });

  it('should not render transaction details when transactionDetails is null', () => {
    component.transactionDetails = null;
    fixture.detectChanges();

    const cardTransaction = getElementBySelector(fixture, '.card-transaction');
    expect(cardTransaction).toBeFalsy();
  });
});
