import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { SpenderOnboardingConnectCardStepComponent } from './spender-onboarding-connect-card-step.component';
import { RealTimeFeedService } from 'src/app/core/services/real-time-feed.service';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, PopoverController } from '@ionic/angular';
import { By } from '@angular/platform-browser';
import { CardNetworkType } from 'src/app/core/enums/card-network-type';
import { NgxMaskModule } from 'ngx-mask';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { statementUploadedCard } from 'src/app/core/mock-data/platform-corporate-card.data';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { orgSettingsData } from 'src/app/core/test-data/org-settings.service.spec.data';

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
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
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
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(null);
    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);
  }));

  it('ngOnInit(): ', () => {
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([]));
    component.ngOnInit();
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

    it('should call enrollSingularCard if enrollableCards is empty', () => {
      // Arrange
      component.enrollableCards = [];
      const enrollSingularCardSpy = spyOn(component, 'enrollSingularCard');
      const enrollMultipleCardsSpy = spyOn(component, 'enrollMultipleCards');

      // Act
      component.enrollCards();

      // Assert
      expect(enrollSingularCardSpy).toHaveBeenCalled();
      expect(enrollMultipleCardsSpy).not.toHaveBeenCalled();
      expect(component.cardsEnrolling).toBeTrue();
    });
  });

  describe('enrollMultipleCards(): ', () => {
    it('should handle successful card enrollment', fakeAsync(() => {
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(
        of([statementUploadedCard, { ...statementUploadedCard, id: 'bacc15bbrRGWzg' }])
      );
      component.ngOnInit();

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

    it('should handle unsuccessful card enrollment', fakeAsync(() => {
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(
        of([statementUploadedCard, { ...statementUploadedCard, id: 'bacc15bbrRGWzg' }])
      );
      component.ngOnInit();

      const stepCompleteSpy = spyOn(component.isStepComplete, 'emit');
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
      expect(stepCompleteSpy).toHaveBeenCalledWith(true);
      expect(showErrorPopoverSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('enrollSingularCard(): ', () => {
    it('should handle successful card enrollment', fakeAsync(() => {
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([]));
      component.ngOnInit();

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
      component.ngOnInit();

      component.fg.controls.card_number.setValue('41111111111111111');
      const stepCompleteSpy = spyOn(component.isStepComplete, 'emit');
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
});
