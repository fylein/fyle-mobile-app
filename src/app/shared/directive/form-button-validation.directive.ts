import { Directive, Input, ElementRef, OnInit, Component, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { Form } from '@angular/forms';
import { Observable } from 'rxjs';

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
  @Input() formToValidate: Form;
  @Input() apiPromise: Observable<any>;

  loadingTextMap = {
    'Save': 'Saving',
    'Confirm': 'Confirming',
    'Update': 'Updating',
    'Add': 'Adding',
    'Delete': 'Deleting',
    'Create': 'Creating',
    'Approve': 'Approving',
    'Reject': 'Rejecting',
    'Pull Back': 'Pulling Back',
    'Send Back': 'Sending Back',
    'Flag': 'Flagging',
    'Verify': 'Verifying',
    'Share': 'Sharing',
    'Email': 'Sending Email',
    'Continue': 'Continuing',
    'Set Exchange Rate': 'Setting Exchange Rate',
    'Sign In': 'Signing In',
    'Sign Up': 'Signing Up',
    'Get Started': 'Getting Started'
  };

  ngOnChanges(changes: SimpleChanges) {
    this.onPromiseChange(changes.apiPromise.currentValue);
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
    // Execute svg-sprite directive
    cssClass = this.buttonType && this.buttonType === 'secondary' ? 'secondaryLoader' : 'primaryLoader';
    this.elementRef.nativeElement.innerHTML = (`${this.elementRef.nativeElement.innerHTML} <div class="${cssClass}"></div>`);
  }

  resetButton() {
    this.elementRef.nativeElement.innerHTML = this.defaultText;
  }

  onPromiseChange(promise) {
    if (!promise) {
      return;
    }

    this.disableButton();
    this.getButtonText();
    this.changeLoadingText();
    this.addLoader();

    promise.subscribe(res => {
      this.resetButton();
    });
  }

  @HostListener('click') onclick(event) {

  }

  ngOnInit() {
    // console.log('formToValidate ->', this.formToValidate);
  }

}
