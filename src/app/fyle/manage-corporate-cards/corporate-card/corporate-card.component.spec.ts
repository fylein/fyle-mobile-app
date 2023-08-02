import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CorporateCardComponent } from './corporate-card.component';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import {
  bankFeedCard,
  mastercardRTFCard,
  statementUploadedCard,
  visaRTFCard,
  yodleeCard,
} from 'src/app/core/mock-data/platform-corporate-card.data';
import { bankFeedSourcesData } from 'src/app/core/mock-data/bank-feed-sources.data';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'app-card-number',
  template: '<div></div>',
})
class MockCardNumberComponent {
  @Input() cardNumber: string;
}

fdescribe('CorporateCardComponent', () => {
  let component: CorporateCardComponent;
  let fixture: ComponentFixture<CorporateCardComponent>;

  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;

  beforeEach(waitForAsync(() => {
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getBankFeedSources',
    ]);

    TestBed.configureTestingModule({
      declarations: [CorporateCardComponent, MockCardNumberComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: CorporateCreditCardExpenseService,
          useValue: corporateCreditCardExpenseServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CorporateCardComponent);
    component = fixture.componentInstance;

    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;

    corporateCreditCardExpenseService.getBankFeedSources.and.returnValue(bankFeedSourcesData);
    component.card = mastercardRTFCard;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly pass the card number to the card number component', () => {
    const cardNumberComponent = fixture.debugElement.query(By.directive(MockCardNumberComponent));

    expect(cardNumberComponent).toBeTruthy();
    expect(cardNumberComponent.componentInstance.cardNumber).toBe(component.card.card_number);
  });

  describe('card logo', () => {
    it('should show the default card icon when the card is not connected to visa and mastercard RTF', () => {
      component.card = statementUploadedCard;

      component.ngOnInit();
      fixture.detectChanges();

      const icon = getElementBySelector(fixture, '[data-testid="default-icon"]');
      expect(icon).toBeTruthy();
    });

    it('should show mastercard icon when the card is connected to mastercard RTF', () => {
      component.card = mastercardRTFCard;
      component.isMastercardRTFEnabled = true;

      component.ngOnInit();
      fixture.detectChanges();

      const icon = getElementBySelector(fixture, '[data-testid="mastercard-icon"]');
      expect(icon).toBeTruthy();
    });

    it('should show visa icon when the card is connected to visa RTF', () => {
      component.card = visaRTFCard;
      component.isVisaRTFEnabled = true;

      component.ngOnInit();
      fixture.detectChanges();

      const icon = getElementBySelector(fixture, '[data-testid="visa-icon"]');
      expect(icon).toBeTruthy();
    });
  });

  describe('options menu button', () => {
    it('should raise an event cardOptionsClick when the button is clicked', () => {
      spyOn(component.cardOptionsClick, 'emit');
      const optionsBtn = getElementBySelector(fixture, '[data-testid="more-options-btn"]') as HTMLButtonElement;
      optionsBtn.click();

      expect(component.cardOptionsClick.emit).toHaveBeenCalled();
    });

    it('should be visible for visa rtf cards', () => {
      component.card = visaRTFCard;
      component.isVisaRTFEnabled = true;

      component.ngOnInit();
      fixture.detectChanges();

      const optionsBtn = getElementBySelector(fixture, '[data-testid="more-options-btn"]');
      expect(optionsBtn).toBeTruthy();
    });

    it('should be visible for mastercard rtf cards', () => {
      component.card = mastercardRTFCard;
      component.isMastercardRTFEnabled = true;

      component.ngOnInit();
      fixture.detectChanges();

      const optionsBtn = getElementBySelector(fixture, '[data-testid="more-options-btn"]');
      expect(optionsBtn).toBeTruthy();
    });

    it('should be visible for statement uploaded cards if either visa/mastercard RTF is enabled for the org', () => {
      component.card = statementUploadedCard;
      component.isMastercardRTFEnabled = true;

      component.ngOnInit();
      fixture.detectChanges();

      const optionsBtn = getElementBySelector(fixture, '[data-testid="more-options-btn"]');
      expect(optionsBtn).toBeTruthy();
    });

    it('should not be visible for statement uploaded cards if neither visa/mastercard RTF is enabled for the org', () => {
      component.card = statementUploadedCard;
      component.isMastercardRTFEnabled = false;
      component.isVisaRTFEnabled = false;

      component.ngOnInit();
      fixture.detectChanges();

      const optionsBtn = getElementBySelector(fixture, '[data-testid="more-options-btn"]');
      expect(optionsBtn).toBeFalsy();
    });

    it('should not be visible for yodlee cards', () => {
      component.card = yodleeCard;

      component.ngOnInit();
      fixture.detectChanges();

      const optionsBtn = getElementBySelector(fixture, '[data-testid="more-options-btn"]');
      expect(optionsBtn).toBeFalsy();
    });

    it('should not be visible for bank feed cards', () => {
      component.card = bankFeedCard;

      component.ngOnInit();
      fixture.detectChanges();

      const optionsBtn = getElementBySelector(fixture, '[data-testid="more-options-btn"]');
      expect(optionsBtn).toBeFalsy();
    });
  });

  describe('feed information', () => {
    it('should show feed live status when the card is connected to visa/mastercard RTF', () => {
      component.card = mastercardRTFCard;

      component.ngOnInit();
      fixture.detectChanges();

      const feedInfo = getElementBySelector(fixture, '[data-testid="feed-info"]');

      expect(feedInfo).toBeTruthy();
      expect(feedInfo.textContent).toBe('Live');
    });

    it('should show the last synced date when the card is connected to yodlee', () => {
      component.card = yodleeCard;

      component.ngOnInit();
      fixture.detectChanges();

      const feedInfo = getElementBySelector(fixture, '[data-testid="feed-info"]');

      expect(feedInfo).toBeTruthy();

      const expectedDateString = new Date(yodleeCard.last_synced_at).toDateString();
      const actualDateString = new Date(feedInfo.textContent).toDateString();

      expect(actualDateString).toEqual(expectedDateString);
    });

    it('should show the data feed source when the card is connected to bank feed', () => {
      component.card = bankFeedCard;

      component.ngOnInit();
      fixture.detectChanges();

      const feedInfo = getElementBySelector(fixture, '[data-testid="feed-info"]');

      expect(feedInfo).toBeTruthy();
      expect(feedInfo.textContent).toBe('Bank Feed');
    });

    it('should show the data feed source when the card is connected to statement upload', () => {
      component.card = statementUploadedCard;

      component.ngOnInit();
      fixture.detectChanges();

      const feedInfo = getElementBySelector(fixture, '[data-testid="feed-info"]');

      expect(feedInfo).toBeTruthy();
      expect(feedInfo.textContent).toBe('Statement Upload');
    });
  });
});
