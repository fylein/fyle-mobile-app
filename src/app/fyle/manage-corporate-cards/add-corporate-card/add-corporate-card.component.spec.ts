import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AddCorporateCardComponent } from './add-corporate-card.component';
import { RealTimeFeedService } from 'src/app/core/services/real-time-feed.service';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { ArrayToCommaListPipe } from 'src/app/shared/pipes/array-to-comma-list.pipe';
import { NgxMaskModule } from 'ngx-mask';
import { ReactiveFormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { statementUploadedCard, visaRTFCard } from 'src/app/core/mock-data/platform-corporate-card.data';
import { of, throwError } from 'rxjs';
import { CardNetworkType } from 'src/app/core/enums/card-network-type';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { Router } from '@angular/router';
import {
  cardEnrolledProperties1,
  cardEnrolledProperties2,
  cardEnrollmentErrorsProperties1,
  cardEnrollmentErrorsProperties2,
  cardEnrollmentErrorsProperties3,
  cardEnrollmentErrorsProperties4,
  enrollingNonRTFCardProperties,
} from 'src/app/core/mock-data/corporate-card-trackers.data';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-alert-info',
  template: '<div></div>',
  standalone: false,
})
export class MockFyAlertInfoComponent {
  @Input() message: string;

  @Input() type: 'information' | 'warning';
}

describe('AddCorporateCardComponent', () => {
  let component: AddCorporateCardComponent;
  let fixture: ComponentFixture<AddCorporateCardComponent>;

  let popoverController: jasmine.SpyObj<PopoverController>;
  let realTimeFeedService: jasmine.SpyObj<RealTimeFeedService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let router: jasmine.SpyObj<Router>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const realTimeFeedServiceSpy = jasmine.createSpyObj('RealTimeFeedService', [
      'getCardTypeFromNumber',
      'enroll',
      'isCardNumberValid',
    ]);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'cardEnrolled',
      'cardEnrollmentErrors',
      'enrollingNonRTFCard',
    ]);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
      events$: of({}),
      loaderTranslations: {},
      cache: new Map(),
      interceptor: {},
    });
    TestBed.configureTestingModule({
      declarations: [AddCorporateCardComponent, MockFyAlertInfoComponent, ArrayToCommaListPipe],
      imports: [IonicModule.forRoot(), NgxMaskModule.forRoot(), ReactiveFormsModule, TranslocoModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: RealTimeFeedService,
          useValue: realTimeFeedServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: Router,
          useValue: {
            url: '/enterprise/manage_corporate_cards',
          },
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCorporateCardComponent);
    component = fixture.componentInstance;

    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    realTimeFeedService = TestBed.inject(RealTimeFeedService) as jasmine.SpyObj<RealTimeFeedService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;

    // Mock translate method to return expected strings
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'pipes.arrayToCommaList.and': 'and',
        'addCorporateCard.enrollmentFailure': 'Something went wrong. Please try after some time.',
        'addCorporateCard.toolbarTitle': 'Add corporate card',
        'addCorporateCard.enterCardNumber': 'Enter card number',
        'addCorporateCard.errorInvalidCardNumber': 'Please enter a valid card number.',
        'addCorporateCard.errorInvalidCardNetworkBoth':
          'Enter a valid Visa or Mastercard number. If you have other cards, please contact your admin.',
        'addCorporateCard.errorInvalidCardNetworkVisa':
          'Enter a valid Visa number. If you have other cards, please contact your admin.',
        'addCorporateCard.errorInvalidCardNetworkMastercard':
          'Enter a valid Mastercard number. If you have other cards, please contact your admin.',
        'addCorporateCard.infoNonRtfYodlee':
          'Enter a valid Visa or Mastercard number. If you have other cards, please add them on Fyle Web or contact your admin.',
        'addCorporateCard.viewTnc': 'View Terms and conditions',
        'addCorporateCard.tncHeading': "By enrolling your card and clicking on 'add', you hereby agree to:",
        'addCorporateCard.tncListItem1Part1': 'Allow your employer,',
        'addCorporateCard.tncListItem1Part2': 'card network',
        'addCorporateCard.tncListItem1Part3':
          ' and Fyle Inc. to access details of all transactions made using the enrolled card. This includes the transaction amount, the name of the merchant, the date and time of the transaction, and any other relevant information deemed necessary to provide services.',
        'addCorporateCard.tncListItem2':
          'Allow Fyle to use the above details to create expenses on your behalf and enable program notifications.',
        'addCorporateCard.tncListItem3Part1': 'Agree to our',
        'addCorporateCard.tncLink1': 'Terms and conditions',
        'addCorporateCard.tncListItem3Part2': ' and ',
        'addCorporateCard.tncLink2': 'Privacy policy',
        'addCorporateCard.loadingText': 'Adding',
        'addCorporateCard.addButton': 'Add',
        'addCorporateCard.addCorporateCard': 'Add corporate card',
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

    // Default inputs
    component.isYodleeEnabled = false;
    component.isMastercardRTFEnabled = true;
    component.isVisaRTFEnabled = true;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the add card popover when clicked on close button', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const closeBtn = getElementBySelector(fixture, '[data-testid="close-btn"') as HTMLButtonElement;
    closeBtn.click();

    fixture.detectChanges();

    expect(popoverController.dismiss).toHaveBeenCalled();
  });

  describe('card issuer icon in input', () => {
    beforeEach(() => {
      realTimeFeedService.isCardNumberValid.and.returnValue(true);
    });

    it('should show a visa icon when entering a card number starting with 4', () => {
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '4111111111111111';
      cardNumberInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      const visaIcon = getElementBySelector(fixture, '[data-testid="visa-icon"]');
      expect(visaIcon).toBeTruthy();
    });

    it('should show a mastercard icon when entering a card number starting with 5', () => {
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.MASTERCARD);

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '5111111111111111';
      cardNumberInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      const mastercardIcon = getElementBySelector(fixture, '[data-testid="mastercard-icon"]');
      expect(mastercardIcon).toBeTruthy();
    });

    it('should show the default card icon when entering entering non visa/mastercard card number', () => {
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.OTHERS);

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '6111111111111111';
      cardNumberInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      const defaultIcon = getElementBySelector(fixture, '[data-testid="default-icon"]');
      expect(defaultIcon).toBeTruthy();
    });
  });

  describe('card number validation errors', () => {
    it('should show an error message when the user has entered an invalid card number', fakeAsync(() => {
      realTimeFeedService.isCardNumberValid.and.returnValue(false);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.OTHERS);

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '6111111111111111';
      cardNumberInput.dispatchEvent(new Event('input'));
      cardNumberInput.dispatchEvent(new Event('blur'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const errorMessage = getElementBySelector(fixture, '[data-testid="error-message"]') as HTMLElement;
      expect(errorMessage.textContent).toContain('Please enter a valid card number.');
    }));

    it('should show an error message if only mastercard rtf is enabled but the user has entered a non-mastercard number', fakeAsync(() => {
      component.isMastercardRTFEnabled = true;
      component.isVisaRTFEnabled = false;
      component.isYodleeEnabled = false;

      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '4111111111111111';
      cardNumberInput.dispatchEvent(new Event('input'));
      cardNumberInput.dispatchEvent(new Event('blur'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const errorMessage = getElementBySelector(fixture, '[data-testid="error-message"]') as HTMLElement;

      expect(errorMessage.textContent).toContain(
        'Enter a valid Mastercard number. If you have other cards, please contact your admin.',
      );
    }));

    it('should show an error message if only visa rtf is enabled but the user has entered a non-visa number', fakeAsync(() => {
      component.isVisaRTFEnabled = true;
      component.isMastercardRTFEnabled = false;
      component.isYodleeEnabled = false;

      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.MASTERCARD);

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '5111111111111111';
      cardNumberInput.dispatchEvent(new Event('input'));
      cardNumberInput.dispatchEvent(new Event('blur'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const errorMessage = getElementBySelector(fixture, '[data-testid="error-message"]') as HTMLElement;

      expect(errorMessage.textContent).toContain(
        'Enter a valid Visa number. If you have other cards, please contact your admin.',
      );
    }));

    it('should show an error message if user has entered a non visa/mastercard card number and yodlee is disabled in the org', fakeAsync(() => {
      component.isVisaRTFEnabled = true;
      component.isMastercardRTFEnabled = true;
      component.isYodleeEnabled = false;

      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.OTHERS);

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '3111111111111111';
      cardNumberInput.dispatchEvent(new Event('input'));
      cardNumberInput.dispatchEvent(new Event('blur'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const errorMessage = getElementBySelector(fixture, '[data-testid="error-message"]') as HTMLElement;
      expect(errorMessage.textContent).toContain(
        'Enter a valid Visa or Mastercard number. If you have other cards, please contact your admin.',
      );
    }));
  });

  describe('card enrollment flow', () => {
    it('should successfully enroll the card and close the popover', () => {
      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);
      realTimeFeedService.enroll.and.returnValue(of(visaRTFCard));

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '4555555555555555';
      cardNumberInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      const addCorporateCardBtn = getElementBySelector(fixture, '[data-testid="add-btn"]') as HTMLButtonElement;
      addCorporateCardBtn.click();

      fixture.detectChanges();

      expect(realTimeFeedService.enroll).toHaveBeenCalledOnceWith('4555555555555555', null);
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ success: true });
      expect(trackingService.cardEnrolled).toHaveBeenCalledOnceWith(cardEnrolledProperties1);
    });

    it('should successfully enroll an existing card to rtf and close the popover', () => {
      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);
      realTimeFeedService.enroll.and.returnValue(of(visaRTFCard));

      component.card = statementUploadedCard;

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '4555555555555555';
      cardNumberInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      const addCorporateCardBtn = getElementBySelector(fixture, '[data-testid="add-btn"]') as HTMLButtonElement;
      addCorporateCardBtn.click();

      fixture.detectChanges();

      expect(realTimeFeedService.enroll).toHaveBeenCalledOnceWith('4555555555555555', statementUploadedCard.id);
      expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ success: true });
      expect(trackingService.cardEnrolled).toHaveBeenCalledOnceWith(cardEnrolledProperties2);
    });

    it('should show the error message received from backend when we face api errors while enrolling the card', () => {
      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);
      realTimeFeedService.enroll.and.returnValue(throwError(() => new Error('This card already exists in the system')));

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '4555555555555555';
      cardNumberInput.dispatchEvent(new Event('input'));
      cardNumberInput.dispatchEvent(new Event('blur'));

      fixture.detectChanges();

      const addCorporateCardBtn = getElementBySelector(fixture, '[data-testid="add-btn"]') as HTMLButtonElement;
      addCorporateCardBtn.click();

      fixture.detectChanges();

      const errorMessage = getElementBySelector(fixture, '[data-testid="error-message"]') as HTMLElement;

      expect(realTimeFeedService.enroll).toHaveBeenCalledOnceWith('4555555555555555', null);
      expect(errorMessage.textContent).toContain('This card already exists in the system');
      expect(trackingService.cardEnrollmentErrors).toHaveBeenCalledWith(cardEnrollmentErrorsProperties1);
    });

    it('should show a default error message when we face api errors from backend but we dont have the error message', () => {
      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);
      realTimeFeedService.enroll.and.returnValue(throwError(() => new Error()));

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '4555555555555555';
      cardNumberInput.dispatchEvent(new Event('input'));
      cardNumberInput.dispatchEvent(new Event('blur'));

      fixture.detectChanges();

      const addCorporateCardBtn = getElementBySelector(fixture, '[data-testid="add-btn"]') as HTMLButtonElement;
      addCorporateCardBtn.click();

      fixture.detectChanges();

      const errorMessage = getElementBySelector(fixture, '[data-testid="error-message"]') as HTMLElement;

      expect(realTimeFeedService.enroll).toHaveBeenCalledOnceWith('4555555555555555', null);
      expect(errorMessage.textContent).toContain('Something went wrong. Please try after some time.');
      expect(trackingService.cardEnrollmentErrors).toHaveBeenCalledOnceWith(cardEnrollmentErrorsProperties2);
    });

    it('should disallow card enrollment if the entered card number is invalid', () => {
      realTimeFeedService.isCardNumberValid.and.returnValue(false);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '4234111111111111';
      cardNumberInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      const addCorporateCardBtn = getElementBySelector(fixture, '[data-testid="add-btn"]') as HTMLButtonElement;
      addCorporateCardBtn.click();

      fixture.detectChanges();

      expect(realTimeFeedService.enroll).not.toHaveBeenCalled();
      expect(trackingService.cardEnrollmentErrors).toHaveBeenCalledOnceWith(cardEnrollmentErrorsProperties3);
    });

    it('should disallow card enrollment if the entered card number is not supported by the org', () => {
      component.isMastercardRTFEnabled = true;
      component.isVisaRTFEnabled = false;
      component.isYodleeEnabled = false;

      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '4111111111111111';
      cardNumberInput.dispatchEvent(new Event('input'));
      cardNumberInput.dispatchEvent(new Event('blur'));

      fixture.detectChanges();

      const addCorporateCardBtn = getElementBySelector(fixture, '[data-testid="add-btn"]') as HTMLButtonElement;
      addCorporateCardBtn.click();

      fixture.detectChanges();

      expect(realTimeFeedService.enroll).not.toHaveBeenCalled();
      expect(trackingService.cardEnrollmentErrors).toHaveBeenCalledOnceWith(cardEnrollmentErrorsProperties4);
    });

    it('should disallow card enrollment and show a warning message if the user has entered a non visa/mastercard card number and yodlee is enabled in the org', fakeAsync(() => {
      component.isYodleeEnabled = true;

      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.OTHERS);

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '3111111111111111';
      cardNumberInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const alertMessageComponent = fixture.debugElement.query(By.directive(MockFyAlertInfoComponent));
      const addCorporateCardBtn = getElementBySelector(fixture, '[data-testid="add-btn"]') as HTMLButtonElement;

      expect(alertMessageComponent).toBeTruthy();
      expect(alertMessageComponent.componentInstance.type).toBe('information');
      expect(alertMessageComponent.componentInstance.message).toBe(
        'Enter a valid Visa or Mastercard number. If you have other cards, please add them on Fyle Web or contact your admin.',
      );
      expect(addCorporateCardBtn.disabled).toBeTrue();
      expect(trackingService.enrollingNonRTFCard).toHaveBeenCalledOnceWith(enrollingNonRTFCardProperties);
    }));
  });

  describe('terms and conditions', () => {
    it('should show the card networks based on the allowed real time feeds by default', () => {
      component.isYodleeEnabled = true;

      component.ngOnInit();
      fixture.detectChanges();

      const termsAndConditions = getElementBySelector(fixture, '[data-testid="tnc-card-networks"]');
      expect(termsAndConditions.textContent).toBe('card network (Visa, Mastercard and Others)');
    });

    it('should show visa in card networks if the user is entering a visa card number', () => {
      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '4111111111111111';
      cardNumberInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      const termsAndConditions = getElementBySelector(fixture, '[data-testid="tnc-card-networks"]');
      expect(termsAndConditions.textContent).toBe('Visa');
    });

    it('should show mastercard in card networks if the user is entering a mastercard card number', () => {
      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.MASTERCARD);

      component.ngOnInit();
      fixture.detectChanges();

      const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
      cardNumberInput.value = '5111111111111111';
      cardNumberInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      const termsAndConditions = getElementBySelector(fixture, '[data-testid="tnc-card-networks"]');
      expect(termsAndConditions.textContent).toBe('Mastercard');
    });
  });
});
