import { Directive, ElementRef, Input, OnChanges } from '@angular/core';
import { LoaderPosition } from './loader-position.enum';

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

  loadingTextMap: Record<string, string> = {
    Save: 'Saving',
    Confirm: 'Confirming',
    Update: 'Updating',
    Add: 'Adding',
    Delete: 'Deleting',
    Create: 'Creating',
    Approve: 'Approving',
    Reject: 'Rejecting',
    'Pull Back': 'Pulling Back',
    'Send Back': 'Sending Back',
    Flag: 'Flagging',
    Verify: 'Verifying',
    Share: 'Sharing',
    Email: 'Sending Email',
    Continue: 'Continuing',
    'Set Exchange Rate': 'Setting Exchange Rate',
    'Sign In': 'Signing In',
    'Sign Up': 'Signing Up',
    'Get Started': 'Getting Started',
  };

  constructor(private elementRef: ElementRef) {}

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
    } else if (this.defaultText && this.loadingTextMap[this.defaultText]) {
      this.selectedElement.innerHTML = `${this.loadingTextMap[this.defaultText]}`;
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
