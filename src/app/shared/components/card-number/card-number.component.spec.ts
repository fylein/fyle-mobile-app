import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CardNumberComponent } from './card-number.component';
import { getElementBySelector } from 'src/app/core/dom-helpers';

describe('CardNumberComponent', () => {
  let component: CardNumberComponent;
  let fixture: ComponentFixture<CardNumberComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CardNumberComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CardNumberComponent);
    component = fixture.componentInstance;

    component.cardNumber = '488888******1234';
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mask 12 digits of the card number and show dots insteads', () => {
    const maskedDigits = getElementBySelector(fixture, '[data-testid="masked-digits"]');
    expect(maskedDigits.childElementCount).toEqual(12);
  });

  it('should show the last four digits unmasked', () => {
    const unmaskedDigits = getElementBySelector(fixture, '[data-testid="unmasked-digits"]');
    expect(unmaskedDigits.textContent.trim()).toBe('1234');
  });
});
