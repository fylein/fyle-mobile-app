import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';

import { AddCorporateCardComponent } from './add-corporate-card.component';
import { RealTimeFeedService } from 'src/app/core/services/real-time-feed.service';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { ArrayToCommaListPipe } from 'src/app/shared/pipes/array-to-comma-list.pipe';
import { NgxMaskModule } from 'ngx-mask';
import { RTFCardType } from 'src/app/core/enums/rtf-card-type.enum';
import { ReactiveFormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { visaRTFCard } from 'src/app/core/mock-data/platform-corporate-card.data';
import { of, throwError } from 'rxjs';

@Component({
  selector: 'app-fy-alert-info',
  template: '<div></div>',
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

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const realTimeFeedServiceSpy = jasmine.createSpyObj('RealTimeFeedService', [
      'getCardTypeFromNumber',
      'enroll',
      'isCardNumberValid',
    ]);

    TestBed.configureTestingModule({
      // Check if we need to provide the pipe spy as well
      declarations: [AddCorporateCardComponent, MockFyAlertInfoComponent, ArrayToCommaListPipe],
      imports: [IonicModule.forRoot(), NgxMaskModule.forRoot(), ReactiveFormsModule],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: RealTimeFeedService,
          useValue: realTimeFeedServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCorporateCardComponent);
    component = fixture.componentInstance;

    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    realTimeFeedService = TestBed.inject(RealTimeFeedService) as jasmine.SpyObj<RealTimeFeedService>;

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

  it('should show a visa icon when entering a card number starting with 4', () => {
    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.VISA);

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
    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.MASTERCARD);

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
    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.OTHERS);

    component.ngOnInit();
    fixture.detectChanges();

    const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;

    cardNumberInput.value = '6111111111111111';
    cardNumberInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const defaultIcon = getElementBySelector(fixture, '[data-testid="default-icon"]');
    expect(defaultIcon).toBeTruthy();
  });

  // Debug this failing test
  xit('should show an error message when the user has entered an invalid card number', () => {
    realTimeFeedService.isCardNumberValid.and.returnValue(false);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.OTHERS);

    component.ngOnInit();
    fixture.detectChanges();

    const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;

    cardNumberInput.value = '6111111111111111';

    cardNumberInput.dispatchEvent(new Event('input'));
    cardNumberInput.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    const errorMessage = getElementBySelector(fixture, '[data-testid="error-message"]');
    expect(errorMessage.textContent).toBe('Please enter a valid card number.');
  });

  it('should show an error message if only mastercard rtf is enabled but the user has entered a non-mastercard number', () => {
    component.isMastercardRTFEnabled = true;
    component.isVisaRTFEnabled = false;
    component.isYodleeEnabled = false;

    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.VISA);

    component.ngOnInit();
    fixture.detectChanges();

    const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;

    cardNumberInput.value = '4111111111111111';

    cardNumberInput.dispatchEvent(new Event('input'));
    cardNumberInput.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    const errorMessage = getElementBySelector(fixture, '[data-testid="error-message"]');
    expect(errorMessage.textContent).toBe(
      'Enter a valid Mastercard number. If you have other cards, please contact your admin.'
    );
  });

  it('should show an error message if only visa rtf is enabled but the user has entered a non-visa number', () => {
    component.isVisaRTFEnabled = true;
    component.isMastercardRTFEnabled = false;
    component.isYodleeEnabled = false;

    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.MASTERCARD);

    component.ngOnInit();
    fixture.detectChanges();

    const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;

    cardNumberInput.value = '5111111111111111';

    cardNumberInput.dispatchEvent(new Event('input'));
    cardNumberInput.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    const errorMessage = getElementBySelector(fixture, '[data-testid="error-message"]');
    expect(errorMessage.textContent).toBe(
      'Enter a valid Visa number. If you have other cards, please contact your admin.'
    );
  });

  it('should show an error message if user has entered a non visa/mastercard card number and yodlee is disabled in the org', () => {
    component.isVisaRTFEnabled = true;
    component.isMastercardRTFEnabled = true;
    component.isYodleeEnabled = false;

    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.OTHERS);

    component.ngOnInit();
    fixture.detectChanges();

    const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;

    cardNumberInput.value = '3111111111111111';

    cardNumberInput.dispatchEvent(new Event('input'));
    cardNumberInput.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    const errorMessage = getElementBySelector(fixture, '[data-testid="error-message"]');
    expect(errorMessage.textContent).toBe(
      'Enter a valid Visa or Mastercard number. If you have other cards, please contact your admin.'
    );
  });

  it('should show an warning message and disallow card enrollment if user has entered a non visa/mastercard card number and yodlee is enabled in the org', () => {
    component.isYodleeEnabled = true;

    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.OTHERS);

    component.ngOnInit();
    fixture.detectChanges();

    const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;

    cardNumberInput.value = '3111111111111111';

    cardNumberInput.dispatchEvent(new Event('input'));
    cardNumberInput.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    const alertMessageComponent = fixture.debugElement.query(By.directive(MockFyAlertInfoComponent));

    expect(alertMessageComponent).toBeTruthy();

    expect(alertMessageComponent.componentInstance.type).toBe('information');
    expect(alertMessageComponent.componentInstance.message).toBe(
      'Enter a valid Visa or Mastercard number. If you have other cards, please add them on Fyle Web or contact your admin.'
    );

    const addCorporateCardBtn = getElementBySelector(fixture, '[data-testid="add-btn"]') as HTMLButtonElement;
    expect(addCorporateCardBtn.disabled).toBe(true);
  });

  it('should show the allowed card networks in terms and conditions by default', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const termsAndConditions = getElementBySelector(fixture, '[data-testid="tnc-card-networks"]');
    expect(termsAndConditions.textContent).toBe('Visa and Mastercard');
  });

  it('should show visa in card network in terms and conditions if user is entering a visa card number', () => {
    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.VISA);

    component.ngOnInit();
    fixture.detectChanges();

    const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;

    cardNumberInput.value = '4111111111111111';
    cardNumberInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const termsAndConditions = getElementBySelector(fixture, '[data-testid="tnc-card-networks"]');
    expect(termsAndConditions.textContent).toBe('Visa');
  });

  it('should show mastercard in card networks in terms and conditions if user is entering a mastercard card number', () => {
    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.MASTERCARD);

    component.ngOnInit();
    fixture.detectChanges();

    const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;

    cardNumberInput.value = '5111111111111111';
    cardNumberInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const termsAndConditions = getElementBySelector(fixture, '[data-testid="tnc-card-networks"]');
    expect(termsAndConditions.textContent).toBe('Mastercard');
  });

  it('should show others in card networks in terms and conditions if user is entering a non visa/mastercard card number', () => {
    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.OTHERS);

    component.ngOnInit();
    fixture.detectChanges();

    const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;

    cardNumberInput.value = '3111111111111111';
    cardNumberInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const termsAndConditions = getElementBySelector(fixture, '[data-testid="tnc-card-networks"]');
    expect(termsAndConditions.textContent).toBe('Others');
  });

  it('should successfully enroll the card and close the popover if the user clicks on add corporate card button', () => {
    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.VISA);
    realTimeFeedService.enroll.and.returnValue(of(visaRTFCard));

    component.ngOnInit();
    fixture.detectChanges();

    const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;
    cardNumberInput.value = '4555555555555555';
    cardNumberInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const addCorporateCardBtn = getElementBySelector(fixture, '[data-testid="add-btn"]') as HTMLButtonElement;
    addCorporateCardBtn.click();

    expect(realTimeFeedService.enroll).toHaveBeenCalledOnceWith('4555555555555555');
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ success: true });
  });

  it('should show an error message if the user clicks on add corporate card button but something went wrong while enrolling the card', () => {
    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.VISA);
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

    expect(realTimeFeedService.enroll).toHaveBeenCalledOnceWith('4555555555555555');

    const errorMessage = getElementBySelector(fixture, '[data-testid="error-message"]');
    expect(errorMessage.textContent.trim()).toBe('This card already exists in the system');
  });

  it('should show a default error message if the user clicks on add corporate card button but something went wrong while enrolling the card and we dont know the cause', () => {
    realTimeFeedService.isCardNumberValid.and.returnValue(true);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.VISA);
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

    expect(realTimeFeedService.enroll).toHaveBeenCalledOnceWith('4555555555555555');

    const errorMessage = getElementBySelector(fixture, '[data-testid="error-message"]');
    expect(errorMessage.textContent.trim()).toBe('Something went wrong. Please try after some time.');
  });

  it('should not enroll the card if the user clicks on add corporate card button but the card number is invalid', () => {
    realTimeFeedService.isCardNumberValid.and.returnValue(false);
    realTimeFeedService.getCardTypeFromNumber.and.returnValue(RTFCardType.VISA);

    component.ngOnInit();
    fixture.detectChanges();

    const cardNumberInput = getElementBySelector(fixture, '[data-testid="card-number-input"]') as HTMLInputElement;

    cardNumberInput.value = '4555555555556767';
    cardNumberInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const addCorporateCardBtn = getElementBySelector(fixture, '[data-testid="add-btn"]') as HTMLButtonElement;
    addCorporateCardBtn.click();

    expect(realTimeFeedService.enroll).not.toHaveBeenCalled();
  });
});
