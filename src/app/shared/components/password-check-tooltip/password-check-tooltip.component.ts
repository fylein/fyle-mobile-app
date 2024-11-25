import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { PasswordChecks } from './password-checks.model';

@Component({
  selector: 'app-password-check-tooltip',
  templateUrl: './password-check-tooltip.component.html',
  styleUrls: ['./password-check-tooltip.component.scss'],
})
export class PasswordCheckTooltipComponent implements OnChanges {
  @Input() password: string;

  @Output() isPasswordValid = new EventEmitter<boolean>();

  passwordChecks: PasswordChecks = {
    lengthValid: false,
    uppercaseValid: false,
    lowercaseValid: false,
    numberValid: false,
    specialCharValid: false,
  };

  ngOnChanges(): void {
    this.validatePassword();
  }

  validatePassword(): void {
    const specialCharRegex = /[!@#$%^&*()+\-:;<=>{}|~?]/;

    this.passwordChecks.lengthValid = this.password.length >= 12 && this.password.length <= 32;
    this.passwordChecks.uppercaseValid = /[A-Z]/.test(this.password);
    this.passwordChecks.lowercaseValid = /[a-z]/.test(this.password);
    this.passwordChecks.numberValid = /[0-9]/.test(this.password);
    this.passwordChecks.specialCharValid = specialCharRegex.test(this.password);

    const allValid = Object.values(this.passwordChecks).every(Boolean);
    this.isPasswordValid.emit(allValid);
  }
}
