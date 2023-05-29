import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LoaderPosition } from './loader-position.enum';

@Directive({
  selector: '[appFormButtonValidation]',
})
export class FormButtonValidationDirective implements OnInit, OnChanges {
  @Input() loadingText: string;

  @Input() buttonType: string;

  @Input() loading: boolean;

  @Input() loaderPosition: LoaderPosition = LoaderPosition.postfix;

  @Input() disabled: boolean;

  defaultText;

  loaderAdded = false;

  loadingTextMap = {
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

  ngOnChanges(changes: SimpleChanges) {
    if (this.disabled) {
      this.disableButton();
      this.elementRef.nativeElement.classList.remove('disabled');
      this.elementRef.nativeElement.innerHTML = this.defaultText;
    } else {
      this.onLoading(this.loading);
    }
  }

  disableButton() {
    this.elementRef.nativeElement.disabled = true;
  }

  getButtonText() {
    this.defaultText = this.elementRef.nativeElement.innerHTML;
  }

  changeLoadingText() {
    if (this.loadingText) {
      this.elementRef.nativeElement.innerHTML = `${this.loadingText}`;
    } else if (this.defaultText && this.loadingTextMap[this.defaultText]) {
      this.elementRef.nativeElement.innerHTML = `${this.loadingTextMap[this.defaultText]}`;
    } else {
      this.elementRef.nativeElement.innerHTML = this.defaultText;
    }
  }

  addLoader() {
    let cssClass = '';
    cssClass = this.buttonType && this.buttonType === 'secondary' ? 'secondary-loader' : 'primary-loader';
    this.elementRef.nativeElement.classList.add('disabled');
    if (this.loaderPosition === LoaderPosition.postfix) {
      this.elementRef.nativeElement.innerHTML = `${this.elementRef.nativeElement.innerHTML} <div class="${cssClass}"></div>`;
    } else {
      this.elementRef.nativeElement.innerHTML = `<div class="${cssClass}"></div>${this.elementRef.nativeElement.innerHTML}`;
    }

    this.loaderAdded = true;
  }

  resetButton() {
    if (this.loaderAdded) {
      this.elementRef.nativeElement.classList.remove('disabled');
      this.elementRef.nativeElement.disabled = false;
      this.elementRef.nativeElement.innerHTML = this.defaultText;
    }
  }

  onLoading(loading) {
    if (loading) {
      this.disableButton();
      this.getButtonText();
      this.changeLoadingText();
      this.addLoader();
    } else {
      this.resetButton();
    }
  }

  ngOnInit() {}
}
