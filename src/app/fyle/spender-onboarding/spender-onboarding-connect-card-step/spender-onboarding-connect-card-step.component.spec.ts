import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { SpenderOnboardingConnectCardStepComponent } from './spender-onboarding-connect-card-step.component';
import { RealTimeFeedService } from 'src/app/core/services/real-time-feed.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, PopoverController } from '@ionic/angular';
import { CardNetworkType } from 'src/app/core/enums/card-network-type';
import { NgxMaskModule } from 'ngx-mask';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { statementUploadedCard } from 'src/app/core/mock-data/platform-corporate-card.data';
import { SimpleChanges } from '@angular/core';
import { orgSettingsData } from 'src/app/core/test-data/org-settings.service.spec.data';
import { PopupAlertComponent } from 'src/app/shared/components/popup-alert/popup-alert.component';

describe('SpenderOnboardingConnectCardStepComponent', () => {
  let component: SpenderOnboardingConnectCardStepComponent;
  let fixture: ComponentFixture<SpenderOnboardingConnectCardStepComponent>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let realTimeFeedService: jasmine.SpyObj<RealTimeFeedService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let fb: FormBuilder;

  beforeEach(waitForAsync(() => {
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getCorporateCards',
    ]);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create', 'dismiss']);
    const realTimeFeedServiceSpy = jasmine.createSpyObj('RealTimeFeedService', [
      'enroll',
      'getCardTypeFromNumber',
      'isCardNumberValid',
    ]);

    TestBed.configureTestingModule({
      declarations: [SpenderOnboardingConnectCardStepComponent],
      imports: [IonicModule.forRoot(), NgxMaskModule.forRoot(), ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: RealTimeFeedService, useValue: realTimeFeedServiceSpy },
        { provide: CorporateCreditCardExpenseService, useValue: corporateCreditCardExpenseServiceSpy },
        { provide: PopoverController, useValue: popoverControllerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SpenderOnboardingConnectCardStepComponent);
    component = fixture.componentInstance;

    realTimeFeedService = TestBed.inject(RealTimeFeedService) as jasmine.SpyObj<RealTimeFeedService>;
    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
    fb = TestBed.inject(FormBuilder);
    component.fg = fb.group({});
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([]));
    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);
  }));

  describe('ngOnInit(): ', () => {
    beforeEach(() => {
      component.enrollableCards = [{ ...statementUploadedCard, card_number: '1111' }];
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(
        of([{ ...statementUploadedCard, card_number: '1111' }])
      );
    });

    it('should setup card form controls', () => {
      realTimeFeedService.isCardNumberValid.and.returnValue(false);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.OTHERS);
      component.ngOnInit();
      component.fg.controls.card_number_bacc15bbrRGWzf.setValue('4111111111');
      fixture.detectChanges();

      expect(component.fg.controls.card_number_bacc15bbrRGWzf.errors.invalidCardNumber).toBeTrue();
    });

    it('should run validator for invalid card network', () => {
      realTimeFeedService.isCardNumberValid.and.returnValue(false);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);
      component.isVisaRTFEnabled = false;
      component.ngOnInit();
      component.fg.controls.card_number_bacc15bbrRGWzf.setValue('4111111111');
      fixture.detectChanges();

      expect(component.fg.controls.card_number_bacc15bbrRGWzf.errors.invalidCardNetwork).toBeTrue();
    });

    it('should run validator for valid card and valid network', () => {
      spyOn(component, 'getFullCardNumber').and.returnValue('4111111111111111');
      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);
      component.isVisaRTFEnabled = true;
      component.ngOnInit();
      fixture.detectChanges();

      expect(component.fg.controls.card_number_bacc15bbrRGWzf.errors.invalidCardNetwork).toBeUndefined();
    });

    it('should run validator for valid card and invalid network', () => {
      spyOn(component, 'getFullCardNumber').and.returnValue('41111111111111');
      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.OTHERS);
      component.isVisaRTFEnabled = false;
      component.ngOnInit();
      fixture.detectChanges();

      expect(component.fg.controls.card_number_bacc15bbrRGWzf.errors.invalidCardNetwork).toBeUndefined();
    });
  });

  it('ngOnChanges(): should update isVisaRTFEnabled and isMastercardRTFEnabled when orgSettings changes', () => {
    component.orgSettings = orgSettingsData;
    const changes: SimpleChanges = {
      orgSettings: {
        firstChange: false,
        isFirstChange: () => false,
        previousValue: '',
        currentValue: orgSettingsData,
      },
    };

    component.ngOnChanges(changes);

    expect(component.isVisaRTFEnabled).toBeTrue();
    expect(component.isMastercardRTFEnabled).toBeTrue();
  });

  describe('setupErrorMessages(): ', () => {
    beforeEach(() => {
      //@ts-ignore
      spyOn(component, 'handleEnrollmentFailures');
    });

    it('should add the masked card number to failedCards', () => {
      const mockError = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
      const mockCardNumber = '5432';

      component.setupErrorMessages(mockError, mockCardNumber);

      expect(component.cardsList.failedCards.length).toBe(1);
      expect(component.cardsList.failedCards[0]).toBe('**** 5432');
    });

    it('should add multiple failed cards to failedCards', () => {
      const mockError1 = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
      const mockCardNumber1 = '5432';

      const mockError2 = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
      const mockCardNumber2 = '5678';

      component.setupErrorMessages(mockError1, mockCardNumber1);
      component.setupErrorMessages(mockError2, mockCardNumber2);

      expect(component.cardsList.failedCards.length).toBe(2);
      expect(component.cardsList.failedCards).toEqual(['**** 5432', '**** 5678']);
    });

    it('should handle cases where cardId is undefined', () => {
      const mockError = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      const mockCardNumber = '4444';

      component.setupErrorMessages(mockError, mockCardNumber);

      //@ts-ignore
      expect(component.handleEnrollmentFailures).toHaveBeenCalledWith(mockError, undefined);
      expect(component.cardsList.failedCards.length).toBe(1);
      expect(component.cardsList.failedCards[0]).toBe('**** 4444');
    });
  });

  it('handleEnrollmentFailures(): should set generic error message for no error message from API', () => {
    const mockError = { status: 404 };

    component.enrollableCards = [];
    component.fg = fb.group({
      card_number: ['', Validators.required],
    });

    //@ts-ignore
    component.handleEnrollmentFailures(mockError);
    expect(component.fg.controls.card_number.errors.enrollmentError).toBeTrue();
    expect(component.singularEnrollmentFailure).toEqual('Something went wrong. Please try after some time.');
  });

  describe('enrollCards(): ', () => {
    it('should call enrollMultipleCards if enrollableCards has items', () => {
      component.enrollableCards = [statementUploadedCard];
      const enrollSingularCardSpy = spyOn(component, 'enrollSingularCard');
      const enrollMultipleCardsSpy = spyOn(component, 'enrollMultipleCards');

      component.enrollCards();

      expect(enrollMultipleCardsSpy).toHaveBeenCalledWith(component.enrollableCards);
      expect(enrollSingularCardSpy).not.toHaveBeenCalled();
      expect(component.cardsEnrolling).toBeTrue();
    });

    it('should call enrollMultipleCards if enrollableCards has items', () => {
      component.enrollableCards = [statementUploadedCard, { ...statementUploadedCard, id: 'bacc15bbrRGWzg' }];
      const enrollSingularCardSpy = spyOn(component, 'enrollSingularCard');
      const enrollMultipleCardsSpy = spyOn(component, 'enrollMultipleCards');
      component.cardValuesMap.bacc15bbrRGWzf = {
        last_four: '1111',
        enrollment_success: true,
        card_type: CardNetworkType.VISA,
      };

      component.enrollCards();

      expect(enrollMultipleCardsSpy).toHaveBeenCalledWith([component.enrollableCards[1]]);
      expect(enrollSingularCardSpy).not.toHaveBeenCalled();
      expect(component.cardsEnrolling).toBeTrue();
    });

    it('should call enrollSingularCard if enrollableCards is empty', () => {
      component.enrollableCards = [];
      const enrollSingularCardSpy = spyOn(component, 'enrollSingularCard');
      const enrollMultipleCardsSpy = spyOn(component, 'enrollMultipleCards');

      component.enrollCards();

      expect(enrollSingularCardSpy).toHaveBeenCalled();
      expect(enrollMultipleCardsSpy).not.toHaveBeenCalled();
      expect(component.cardsEnrolling).toBeTrue();
    });
  });

  describe('generateMessage(): ', () => {
    beforeEach(() => {
      component.cardsList = {
        successfulCards: [],
        failedCards: [],
      };
    });

    it('should return the message for successful cards with failed cards present', () => {
      component.cardsList.successfulCards.push('**** 5678');
      component.cardsList.failedCards.push('**** 1234');
      const message = component.generateMessage();

      expect(message).toBe(
        'We ran into an issue while processing your request. You can cancel and retry connecting the failed card or proceed to the next step.'
      );
    });

    it('should return the message for multiple failed cards', () => {
      component.cardsList.failedCards = ['**** 1234', '**** 5678', '**** 9012'];
      fixture.detectChanges();
      const message = component.generateMessage();
      expect(message).toBe(
        `We ran into an issue while processing your request for the cards  **** 1234, **** 5678 and **** 9012. You can cancel and retry connecting the failed card or proceed to the next step.`
      );
    });

    it('should return the message for a single failed card', () => {
      component.cardsList.failedCards = ['**** 1234'];
      component.cardsList.successfulCards = [];

      fixture.detectChanges();
      const message = component.generateMessage();

      expect(message).toBe(
        `We ran into an issue while processing your request for the card **** 1234. You can cancel and retry connecting the failed card or proceed to the next step.`
      );
    });
  });

  describe('enrollMultipleCards(): ', () => {
    it('should handle successful card enrollment - existing card', fakeAsync(() => {
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(
        of([statementUploadedCard, { ...statementUploadedCard, id: 'bacc15bbrRGWzg' }])
      );
      component.enrollableCards = [statementUploadedCard, { ...statementUploadedCard, id: 'bacc15bbrRGWzg' }];
      component.fg = fb.group({
        card_number_bacc15bbrRGWzf: ['', Validators.required],
        card_number_bacc15bbrRGWzg: ['', Validators.required],
      });

      component.cardValuesMap = {
        bacc15bbrRGWzf: {
          last_four: '5555',
          card_type: CardNetworkType.OTHERS,
        },
        bacc15bbrRGWzg: {
          last_four: '5555',
          card_type: CardNetworkType.OTHERS,
        },
      };

      const stepCompleteSpy = spyOn(component.isStepComplete, 'emit');
      const showErrorPopoverSpy = spyOn(component, 'showErrorPopover');
      const setupErrorMessagesSpy = spyOn(component, 'setupErrorMessages');
      realTimeFeedService.enroll.and.returnValues(of(statementUploadedCard), of(statementUploadedCard));
      component.enrollMultipleCards(component.enrollableCards);
      tick();
      expect(component.cardsList.successfulCards).toEqual(['**** 5555', '**** 5555']);
      expect(component.cardsEnrolling).toBeFalse();
      expect(stepCompleteSpy).toHaveBeenCalledWith(true);
      expect(showErrorPopoverSpy).not.toHaveBeenCalled();
      expect(setupErrorMessagesSpy).not.toHaveBeenCalled();
    }));

    it('should handle unsuccessful card enrollment - new card', fakeAsync(() => {
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(
        of([statementUploadedCard, { ...statementUploadedCard, id: 'bacc15bbrRGWzg' }])
      );
      component.enrollableCards = [statementUploadedCard, { ...statementUploadedCard, id: 'bacc15bbrRGWzg' }];
      component.cardValuesMap = {
        bacc15bbrRGWzf: {
          last_four: '5555',
          card_type: CardNetworkType.OTHERS,
        },
        bacc15bbrRGWzg: {
          last_four: '5555',
          card_type: CardNetworkType.OTHERS,
        },
      };
      component.fg = fb.group({
        card_number_bacc15bbrRGWzf: ['', Validators.required],
        card_number_bacc15bbrRGWzg: ['', Validators.required],
      });

      const showErrorPopoverSpy = spyOn(component, 'showErrorPopover');
      realTimeFeedService.enroll.and.returnValues(
        of(statementUploadedCard),
        throwError(() => new Error('This card already exists in the system'))
      );
      component.enrollMultipleCards(component.enrollableCards);
      tick();
      expect(component.cardsList.successfulCards).toEqual(['**** 5555']);
      expect(component.cardsList.failedCards).toEqual(['**** 5555']);
      expect(component.cardsEnrolling).toBeFalse();
      expect(showErrorPopoverSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('enrollSingularCard(): ', () => {
    it('should handle successful card enrollment', fakeAsync(() => {
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([]));
      component.fg = fb.group({
        card_number: ['', Validators.required],
      });
      component.fg.controls.card_number.setValue('41111111111111111');
      const stepCompleteSpy = spyOn(component.isStepComplete, 'emit');
      const showErrorPopoverSpy = spyOn(component, 'showErrorPopover');
      const setupErrorMessagesSpy = spyOn(component, 'setupErrorMessages');
      realTimeFeedService.enroll.and.returnValues(of(statementUploadedCard));
      component.enrollSingularCard();
      tick();
      expect(component.cardsList.successfulCards).toEqual(['**** 1111']);
      expect(component.cardsEnrolling).toBeFalse();
      expect(stepCompleteSpy).toHaveBeenCalledWith(true);
      expect(showErrorPopoverSpy).not.toHaveBeenCalled();
      expect(setupErrorMessagesSpy).not.toHaveBeenCalled();
    }));

    it('should handle unsuccessful card enrollment', fakeAsync(() => {
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([]));
      component.fg = fb.group({
        card_number: ['', Validators.required],
      });
      component.fg.controls.card_number.setValue('41111111111111111');
      const showErrorPopoverSpy = spyOn(component, 'showErrorPopover');
      realTimeFeedService.enroll.and.returnValues(
        throwError(() => new Error('This card already exists in the system'))
      );
      component.enrollSingularCard();
      tick();
      expect(component.cardsList.failedCards).toEqual(['**** 1111']);
      expect(component.cardsEnrolling).toBeFalse();
      expect(showErrorPopoverSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('showErrorPopover(): ', () => {
    it('should display a popover and handle its actions', () => {
      const popoverSpy = jasmine.createSpyObj('popover', ['present', 'onWillDismiss']);
      spyOn(component, 'generateMessage').and.returnValue('Error message');
      popoverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'close',
        },
      });
      popoverController.create.and.resolveTo(popoverSpy);
      component.cardsList = {
        successfulCards: [],
        failedCards: ['**** 1111'],
      };
      fixture.detectChanges();
      component.showErrorPopover();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        componentProps: {
          title: 'Failed connecting',
          message: 'Error message',
          primaryCta: {
            text: 'Proceed anyway',
            action: 'close',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'cancel',
          },
          cardsList: {},
        },
        component: PopupAlertComponent,
        cssClass: 'pop-up-in-center',
      });
    });

    it('should display a popover when successful cards are present and handle its actions', () => {
      const popoverSpy = jasmine.createSpyObj('popover', ['present', 'onWillDismiss']);
      spyOn(component, 'generateMessage').and.returnValue('Error message');
      popoverSpy.onWillDismiss.and.resolveTo({
        data: {
          action: 'close',
        },
      });
      popoverController.create.and.resolveTo(popoverSpy);
      component.cardsList = {
        successfulCards: ['**** 1111'],
        failedCards: ['**** 1111'],
      };
      fixture.detectChanges();
      component.showErrorPopover();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        componentProps: {
          title: 'Status summary',
          message: 'Error message',
          primaryCta: {
            text: 'Proceed anyway',
            action: 'close',
          },
          secondaryCta: {
            text: 'Cancel',
            action: 'cancel',
          },
          cardsList: component.cardsList,
        },
        component: PopupAlertComponent,
        cssClass: 'pop-up-in-center',
      });
    });
  });

  describe('onCardNumberUpdate(): ', () => {
    it('should update card_type for the given card or singleEnrollableCardDetails - new card', () => {
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([]));
      component.enrollableCards = [];
      component.fg = fb.group({
        card_number: ['', Validators.required],
      });
      component.fg.controls.card_number.setValue('4111111111111111');

      component.onCardNumberUpdate();
      expect(component.singleEnrollableCardDetails.card_type).toBe(CardNetworkType.VISA);
    });

    it('should update card_type for the given card or singleEnrollableCardDetails - existing card', () => {
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);
      component.cardValuesMap.bacc15bbrRGWzf = {
        last_four: '1111',
        card_type: CardNetworkType.VISA,
      };
      component.enrollableCards = [statementUploadedCard, { ...statementUploadedCard, id: 'bacc15bbrRGWzg' }];
      component.fg = fb.group({
        card_number_bacc15bbrRGWzf: ['', Validators.required],
      });
      component.fg.controls.card_number_bacc15bbrRGWzf.setValue('4111111111111111');

      component.onCardNumberUpdate(statementUploadedCard);
      expect(component.cardValuesMap.bacc15bbrRGWzf.card_type).toBe(CardNetworkType.VISA);
    });
  });
});
