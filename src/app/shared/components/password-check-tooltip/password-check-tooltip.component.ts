import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';
import { PasswordChecks } from './password-checks.model';
import { PasswordCriteria } from './password-criteria.model';

@Component({
  selector: 'app-password-check-tooltip',
  templateUrl: './password-check-tooltip.component.html',
  styleUrls: ['./password-check-tooltip.component.scss'],
})
export class PasswordCheckTooltipComponent implements OnChanges {
  @Input() password: string;

  @Output() isPasswordValid = new EventEmitter<boolean>();

  passwordChecks: PasswordChecks = Object.freeze({
    lengthValid: false,
    uppercaseValid: false,
    lowercaseValid: false,
    numberValid: false,
    specialCharValid: false,
  });

  passwordCriteria: PasswordCriteria[];

  const PASSWORD_CRITERIA_MESSAGES = {
    lengthValid: '12 to 32 characters',
    uppercaseValid: '1 uppercase character',
    lowercaseValid: '1 lowercase character',
    numberValid: '1 number',
    specialCharValid: '1 special character',
  } as const;

  updatePasswordCriteria(): void {
    this.passwordCriteria = Object.entries(PASSWORD_CRITERIA_MESSAGES).map(([key, message]) => ({
      isValid: this.passwordChecks[key as keyof PasswordChecks],
      message,
    }));
  }
  }

  ngOnChanges(): void {
    this.validatePassword();
  }

  validatePassword(): void {
    if (!this.password) {
      Object.keys(this.passwordChecks).forEach((key) => {
        this.passwordChecks[key as keyof PasswordChecks] = false;
      });
      this.isPasswordValid.emit(false);
      return;
    }

    const specialCharRegex = /[!@#$%^&*()+\-:;<=>{}|~?]/;

    this.passwordChecks.lengthValid = this.password.length >= 12 && this.password.length <= 32;
    this.passwordChecks.uppercaseValid = /[A-Z]/.test(this.password);
    this.passwordChecks.lowercaseValid = /[a-z]/.test(this.password);
    this.passwordChecks.numberValid = /[0-9]/.test(this.password);
    this.passwordChecks.specialCharValid = specialCharRegex.test(this.password);

    this.updatePasswordCriteria();
    // Boolean() returns true for true values
    const allValid = Object.values(this.passwordChecks).every(Boolean);
    this.isPasswordValid.emit(allValid);
  }
}
