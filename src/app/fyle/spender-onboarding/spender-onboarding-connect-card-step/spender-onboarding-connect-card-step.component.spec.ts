import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CorporateCreditCardExpenseService } from 'src/app/core/services/corporate-credit-card-expense.service';
import { SpenderOnboardingConnectCardStepComponent } from './spender-onboarding-connect-card-step.component';
import { RealTimeFeedService } from 'src/app/core/services/real-time-feed.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
import { By } from '@angular/platform-browser';
import { CardNetworkType } from 'src/app/core/enums/card-network-type';

fdescribe('SpenderOnboardingConnectCardStepComponent', () => {
  let component: SpenderOnboardingConnectCardStepComponent;
  let fixture: ComponentFixture<SpenderOnboardingConnectCardStepComponent>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let realTimeFeedService: jasmine.SpyObj<RealTimeFeedService>;
  let fb: FormBuilder;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(async () => {
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getCorporateCards',
    ]);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const realTimeFeedServiceSpy = jasmine.createSpyObj('RealTimeFeedService', [
      'getCardTypeFromNumber',
      'enroll',
      'isCardNumberValid',
    ]);

    await TestBed.configureTestingModule({
      declarations: [SpenderOnboardingConnectCardStepComponent],
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
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
  });

  describe('template', () => {
    it('onCardNumberUpdate(): should call onCardNumberUpdate when input changes', () => {
      spyOn(component, 'onCardNumberUpdate');
      const input = fixture.debugElement.query(By.css('[data-testid="card-number-input"]')).nativeElement;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.onCardNumberUpdate).toHaveBeenCalled();
    });

    fit('should enable Continue button when form is valid', () => {
      component.fg = fb.group({
        // @ts-ignore
        card_number_bacc1234: [
          '',
          Validators.compose([
            Validators.required,
            Validators.maxLength(16),
            component.cardNumberValidator.bind(this),
            component.cardNetworkValidator.bind(this),
          ]),
        ],
      });
      realTimeFeedService.isCardNumberValid.and.returnValue(true);
      realTimeFeedService.getCardTypeFromNumber.and.returnValue(CardNetworkType.VISA);
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
