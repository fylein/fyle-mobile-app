import { Directive, ElementRef, Input, OnChanges } from '@angular/core';
import { LoaderPosition } from './loader-position.enum';
import { TranslocoService } from '@jsverse/transloco';

@Directive({
  selector: '[appFormButtonValidation]',
})
export class FormButtonValidationDirective implements OnChanges {
  @Input() loadingText: string;

  @Input() buttonType: string;

  @Input() loading: boolean;

  @Input() loaderPosition: LoaderPosition = LoaderPosition.postfix;

  defaultText: string;

  loaderAdded = false;

  loadingTextKeyMap: Record<string, string> = {
    Save: 'directives.formButtonValidation.saving',
    Confirm: 'directives.formButtonValidation.confirming',
    Update: 'directives.formButtonValidation.updating',
    Add: 'directives.formButtonValidation.adding',
    Delete: 'directives.formButtonValidation.deleting',
    Create: 'directives.formButtonValidation.creating',
    Approve: 'directives.formButtonValidation.approving',
    Reject: 'directives.formButtonValidation.rejecting',
    'Pull Back': 'directives.formButtonValidation.pullingBack',
    'Send Back': 'directives.formButtonValidation.sendingBack',
    Flag: 'directives.formButtonValidation.flagging',
    Verify: 'directives.formButtonValidation.verifying',
    Share: 'directives.formButtonValidation.sharing',
    Email: 'directives.formButtonValidation.sendingEmail',
    Continue: 'directives.formButtonValidation.continuing',
    'Set Exchange Rate': 'directives.formButtonValidation.settingExchangeRate',
    'Sign In': 'directives.formButtonValidation.signingIn',
    'Sign Up': 'directives.formButtonValidation.signingUp',
    'Get Started': 'directives.formButtonValidation.gettingStarted',
  };

  constructor(private elementRef: ElementRef, private translocoService: TranslocoService) {}

  get selectedElement(): HTMLElement & { disabled?: boolean } {
    return this.elementRef?.nativeElement as HTMLElement & { disabled?: boolean };
  }

  ngOnChanges(): void {
    this.onLoading(this.loading);
  }

  disableButton(): void {
    this.selectedElement.disabled = true;
  }

  getButtonText(): void {
    this.defaultText = this.selectedElement.innerHTML;
  }

  changeLoadingText(): void {
    if (this.loadingText) {
      this.selectedElement.innerHTML = `${this.loadingText}`;
    } else if (this.defaultText && this.loadingTextKeyMap[this.defaultText]) {
      this.selectedElement.innerHTML = `${this.translocoService.translate(this.loadingTextKeyMap[this.defaultText])}`;
    } else {
      this.selectedElement.innerHTML = this.defaultText;
    }
  }

  addLoader(): void {
    let cssClass = '';
    cssClass = this.buttonType && this.buttonType === 'secondary' ? 'secondary-loader' : 'primary-loader';
    this.selectedElement.classList.add('disabled');
    if (this.loaderPosition === LoaderPosition.postfix) {
      this.selectedElement.innerHTML = `${this.selectedElement.innerHTML} <div class="${cssClass}"></div>`;
    } else {
      this.selectedElement.innerHTML = `<div class="${cssClass}"></div>${this.selectedElement.innerHTML}`;
    }

    this.loaderAdded = true;
  }

  resetButton(): void {
    if (this.loaderAdded) {
      this.selectedElement.classList.remove('disabled');
      this.selectedElement.disabled = false;
      this.selectedElement.innerHTML = this.defaultText;
    }
  }

  onLoading(loading: boolean): void {
    if (loading) {
      this.disableButton();
      this.getButtonText();
      this.changeLoadingText();
      this.addLoader();
    } else {
      this.resetButton();
    }
  }
}
