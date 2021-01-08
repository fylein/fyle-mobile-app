import { Directive, Input, ElementRef, OnInit, Component, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { Form } from '@angular/forms';
import { Observable, of } from 'rxjs';

@Directive({
  selector: '[appFormButtonValidation]'
})

export class FormButtonValidationDirective implements OnInit, OnChanges{

  constructor(
    private elementRef: ElementRef
  ) { }

  defaultText;
  @Input() loadingText: string;
  @Input() buttonType: string;
  @Input() loading: boolean;
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
    'Get Started': 'Getting Started'
  };

  ngOnChanges(changes: SimpleChanges) {
    this.onLoading(this.loading);
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
    this.elementRef.nativeElement.innerHTML = (`${this.elementRef.nativeElement.innerHTML} <div class="${cssClass}"></div>`);
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
