import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IonicModule } from '@ionic/angular';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { corporateCardTransaction } from 'src/app/core/models/platform/v1/cc-transaction.model';
import { EllipsisPipe } from 'src/app/shared/pipes/ellipses.pipe';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { CardTransactionPreviewComponent } from './card-transaction-preview.component';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CardTransactionPreviewComponent', () => {
  let component: CardTransactionPreviewComponent;
  let fixture: ComponentFixture<CardTransactionPreviewComponent>;

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
      declarations: [CardTransactionPreviewComponent, EllipsisPipe],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, TranslocoModule],
      providers: [
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CardTransactionPreviewComponent);
    component = fixture.componentInstance;

    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'cardTransactionPreview.header': 'Card transaction',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
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
