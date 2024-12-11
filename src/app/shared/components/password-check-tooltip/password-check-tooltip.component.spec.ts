import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PasswordCheckTooltipComponent } from './password-check-tooltip.component';
import { By } from '@angular/platform-browser';

describe('PasswordCheckTooltipComponent', () => {
  let component: PasswordCheckTooltipComponent;
  let fixture: ComponentFixture<PasswordCheckTooltipComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PasswordCheckTooltipComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordCheckTooltipComponent);
    component = fixture.componentInstance;
    component.passwordCriteria = [
      {
        isValid: false,
        message: '12 to 32 characters',
      },
      {
        isValid: false,
        message: '1 uppercase character',
      },
      {
        isValid: false,
        message: '1 lowercase character',
      },
      {
        isValid: false,
        message: '1 number',
      },
      {
        isValid: false,
        message: '1 special character',
      },
    ];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges(): should call validatePassword when ngOnChanges is triggered', () => {
    spyOn(component, 'validatePassword');
    component.password = 'ValidPass123!';
    component.ngOnChanges();
    expect(component.validatePassword).toHaveBeenCalledTimes(1);
  });

  describe('validatePassword(): ', () => {
    beforeEach(() => {
      component.previousValidityState = true;
    });

    it('should fail when password length is less than 12 characters', () => {
      const emitSpy = spyOn(component.isPasswordValid, 'emit');
      component.password = 'Short1!';
      fixture.detectChanges();
      component.validatePassword();
      expect(component.passwordChecks.lengthValid).toBeFalse();
      expect(emitSpy).toHaveBeenCalledWith(false);
    });

    it('should fail when password length is more than 32 characters', () => {
      const emitSpy = spyOn(component.isPasswordValid, 'emit');
      component.password = 'A'.repeat(33) + '1!';
      component.validatePassword();
      expect(component.passwordChecks.lengthValid).toBeFalse();
      expect(emitSpy).toHaveBeenCalledWith(false);
    });

    it('should fail when password is missing an uppercase character', () => {
      const emitSpy = spyOn(component.isPasswordValid, 'emit');
      component.password = 'lowercase1!';
      component.validatePassword();
      expect(component.passwordChecks.uppercaseValid).toBeFalse();
      expect(emitSpy).toHaveBeenCalledWith(false);
    });

    it('should fail when password is missing a lowercase character', () => {
      const emitSpy = spyOn(component.isPasswordValid, 'emit');
      component.password = 'UPPERCASE1!';
      component.validatePassword();
      expect(component.passwordChecks.lowercaseValid).toBeFalse();
      expect(emitSpy).toHaveBeenCalledWith(false);
    });

    it('should fail when password is missing a numeric character', () => {
      const emitSpy = spyOn(component.isPasswordValid, 'emit');
      component.password = 'OnlyAlphabets!';
      component.validatePassword();
      expect(component.passwordChecks.numberValid).toBeFalse();
      expect(emitSpy).toHaveBeenCalledWith(false);
    });

    it('should fail when password is missing a special character', () => {
      const emitSpy = spyOn(component.isPasswordValid, 'emit');
      component.password = 'NoSpecials1';
      component.validatePassword();
      expect(component.passwordChecks.specialCharValid).toBeFalse();
      expect(emitSpy).toHaveBeenCalledWith(false);
    });

    it('should pass when password meets all criteria', () => {
      component.previousValidityState = false;
      const emitSpy = spyOn(component.isPasswordValid, 'emit');
      component.password = 'ValidPass123!';
      component.validatePassword();
      expect(component.passwordChecks.lengthValid).toBeTrue();
      expect(component.passwordChecks.uppercaseValid).toBeTrue();
      expect(component.passwordChecks.lowercaseValid).toBeTrue();
      expect(component.passwordChecks.numberValid).toBeTrue();
      expect(component.passwordChecks.specialCharValid).toBeTrue();
      expect(emitSpy).toHaveBeenCalledWith(true);
    });

    it('should fail when password is empty', () => {
      const emitSpy = spyOn(component.isPasswordValid, 'emit');
      component.password = '';
      component.validatePassword();
      expect(component.passwordChecks.lengthValid).toBeFalse();
      expect(component.passwordChecks.uppercaseValid).toBeFalse();
      expect(component.passwordChecks.lowercaseValid).toBeFalse();
      expect(component.passwordChecks.numberValid).toBeFalse();
      expect(component.passwordChecks.specialCharValid).toBeFalse();
      expect(emitSpy).toHaveBeenCalledWith(false);
    });
  });

  describe('template', () => {
    it('should render the tooltip text and all checks when all validations are false', () => {
      component.passwordChecks = {
        lengthValid: false,
        uppercaseValid: false,
        lowercaseValid: false,
        numberValid: false,
        specialCharValid: false,
      };
      fixture.detectChanges();

      const tooltipText = fixture.debugElement.query(By.css('.tooltip__text')).nativeElement;
      const listItems = fixture.debugElement.queryAll(By.css('.tooltip__list__check'));
      expect(tooltipText.textContent).toContain('Password should contain:');
      expect(listItems.length).toBe(5);
    });

    it('should display valid icons for valid password checks', () => {
      component.password = 'Somepass1';
      component.ngOnChanges();
      fixture.detectChanges();

      const validIcons = fixture.debugElement.queryAll(By.css('.tooltip__list__check__valid'));
      expect(validIcons.length).toBe(3);
      const invalidIcons = fixture.debugElement.queryAll(By.css('.tooltip__list__check__invalid'));
      expect(invalidIcons.length).toBe(2);
    });
  });
});
