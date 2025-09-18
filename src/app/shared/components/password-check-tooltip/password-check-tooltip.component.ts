import { Component, Input, OnChanges, OnInit, SimpleChanges, inject, output } from '@angular/core';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { PasswordChecks } from './password-checks.model';
import { PasswordCriteria } from './password-criteria.model';
import { IonIcon } from '@ionic/angular/standalone';


@Component({
  selector: 'app-password-check-tooltip',
  templateUrl: './password-check-tooltip.component.html',
  styleUrls: ['./password-check-tooltip.component.scss'],
  imports: [
    IonIcon,
    TranslocoPipe
  ],
})
export class PasswordCheckTooltipComponent implements OnChanges, OnInit {
  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() password: string;

  readonly isPasswordValid = output<boolean>();

  passwordChecks: PasswordChecks = {
    lengthValid: false,
    uppercaseValid: false,
    lowercaseValid: false,
    numberValid: false,
    specialCharValid: false,
  };

  passwordCriteria: PasswordCriteria[];

  updatePasswordCriteria(): void {
    this.passwordCriteria = [
      {
        isValid: this.passwordChecks.lengthValid,
        message: this.translocoService.translate('passwordCheckTooltip.lengthRequirement'),
      },
      {
        isValid: this.passwordChecks.uppercaseValid,
        message: this.translocoService.translate('passwordCheckTooltip.uppercaseRequirement'),
      },
      {
        isValid: this.passwordChecks.lowercaseValid,
        message: this.translocoService.translate('passwordCheckTooltip.lowercaseRequirement'),
      },
      {
        isValid: this.passwordChecks.numberValid,
        message: this.translocoService.translate('passwordCheckTooltip.numberRequirement'),
      },
      {
        isValid: this.passwordChecks.specialCharValid,
        message: this.translocoService.translate('passwordCheckTooltip.specialCharRequirement'),
      },
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.password.currentValue !== changes.password.previousValue) {
      this.validatePassword();
    }
  }

  ngOnInit(): void {
    this.updatePasswordCriteria();
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
    // Using Boolean() with every() ensures strict boolean comparison for all password criteria
    const allValid = Object.values(this.passwordChecks).every(Boolean);
    this.isPasswordValid.emit(allValid);
  }
}
