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

fdescribe('SpenderOnboardingConnectCardStepComponent', () => {
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
    const cards = [statementUploadedCard, statementUploadedCard];
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of(cards));
  }));

  it('setupErrorMessages(): should add card to failedCards and call handleEnrollmentFailures', () => {
    const error = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
    //@ts-ignore
    spyOn(component, 'handleEnrollmentFailures');

    component.cardsList = { failedCards: [], successfulCards: [] }; // Initialize card list
    component.setupErrorMessages(error, '1234', 'bacc1234');

    expect(component.cardsList.failedCards).toContain('**** 1234');
    //@ts-ignore
    expect(component.handleEnrollmentFailures).toHaveBeenCalledWith(error, 'bacc1234');
  });

  fdescribe('enrollMultipleCards(): ', () => {
    beforeEach(() => {});

    it('should call enroll for each card and handle success and failure cases', fakeAsync(() => {
      const cards = [statementUploadedCard, statementUploadedCard];
      component.cardsList = { failedCards: [], successfulCards: [] }; // Initialize card list
      component.cardValuesMap = {
        bacc123456: { last_four: '1111', card_type: CardNetworkType.OTHERS },
        bacc654321: { last_four: '0004', card_type: CardNetworkType.OTHERS },
      }; // Mock card values
      component.fg = new FormBuilder().group({
        card_number_bacc123456: ['411111111111', Validators.required],
        card_number_bacc654321: ['550000000000', Validators.required],
      });

      realTimeFeedService.enroll.and.returnValues(
        of(null), // Success for first card
        throwError(new HttpErrorResponse({ status: 400, statusText: 'Bad Request' })) // Error for second card
      );

      spyOn(component, 'setupErrorMessages');
      spyOn(component, 'showErrorPopover');

      component.enrollMultipleCards(cards);

      fixture.detectChanges();
      tick();
      expect(realTimeFeedService.enroll).toHaveBeenCalledWith('4111111111111111', 'bacc123456');
      expect(realTimeFeedService.enroll).toHaveBeenCalledWith('5500000000000004', 'bacc654321');
      expect(component.cardsList.successfulCards).toContain('**** 1111');
      expect(component.cardsList.failedCards).toContain('**** 550000000000');
      expect(component.setupErrorMessages).toHaveBeenCalled();
      expect(component.showErrorPopover).toHaveBeenCalled();
    }));
  });

  xdescribe('template', () => {
    beforeEach(() => {
      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);
    });

    it('should call onCardNumberUpdate when input changes', () => {
      component.fg = fb.group({
        card_number: [
          '',
          Validators.compose([
            Validators.required,
            Validators.maxLength(16),
            // @ts-ignore
            component.cardNumberValidator.bind(this),
            // @ts-ignore
            component.cardNetworkValidator.bind(this),
          ]),
        ],
      });
      fixture.detectChanges();
      const cardNumberUpdateSpy = spyOn(component, 'onCardNumberUpdate');
      const input = fixture.debugElement.query(By.css('[data-testid="card-number-input"]')).nativeElement;
      input.dispatchEvent(new Event('input'));
      expect(cardNumberUpdateSpy).toHaveBeenCalled();
    });

    it('should enable Continue button when form is valid', () => {
      component.fg = fb.group({
        card_number: [
          '',
          Validators.compose([
            Validators.required,
            Validators.maxLength(16),
            // @ts-ignore
            component.cardNumberValidator.bind(this),
            // @ts-ignore
            component.cardNetworkValidator.bind(this),
          ]),
        ],
      });
      // eslint-disable-next-line @typescript-eslint/dot-notation
      component.fg.controls['card_number_bacc1234'].setValue('4111111111111111');
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('.connect-card__primary-cta')).nativeElement;
      expect(button.disabled).toBeFalse();
    });

    it('should call enrollCards on Continue button click', () => {
      spyOn(component, 'enrollCards');
      const button = fixture.debugElement.query(By.css('.connect-card__primary-cta')).nativeElement;
      button.click();
      expect(component.enrollCards).toHaveBeenCalled();
    });
  });
});
