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

  // Map button translation keys to loading state translation keys
  loadingTextKeyMap: Record<string, string> = {
    'directives.buttonTranslationKeys.save': 'directives.formButtonValidation.saving',
    'directives.buttonTranslationKeys.confirm': 'directives.formButtonValidation.confirming',
    'directives.buttonTranslationKeys.update': 'directives.formButtonValidation.updating',
    'directives.buttonTranslationKeys.add': 'directives.formButtonValidation.adding',
    'directives.buttonTranslationKeys.delete': 'directives.formButtonValidation.deleting',
    'directives.buttonTranslationKeys.create': 'directives.formButtonValidation.creating',
    'directives.buttonTranslationKeys.approve': 'directives.formButtonValidation.approving',
    'directives.buttonTranslationKeys.reject': 'directives.formButtonValidation.rejecting',
    'directives.buttonTranslationKeys.pullBack': 'directives.formButtonValidation.pullingBack',
    'directives.buttonTranslationKeys.sendBack': 'directives.formButtonValidation.sendingBack',
    'directives.buttonTranslationKeys.flag': 'directives.formButtonValidation.flagging',
    'directives.buttonTranslationKeys.verify': 'directives.formButtonValidation.verifying',
    'directives.buttonTranslationKeys.share': 'directives.formButtonValidation.sharing',
    'directives.buttonTranslationKeys.email': 'directives.formButtonValidation.sendingEmail',
    'directives.buttonTranslationKeys.continue': 'directives.formButtonValidation.continuing',
    'directives.buttonTranslationKeys.setExchangeRate': 'directives.formButtonValidation.settingExchangeRate',
    'directives.buttonTranslationKeys.signIn': 'directives.formButtonValidation.signingIn',
    'directives.buttonTranslationKeys.signUp': 'directives.formButtonValidation.signingUp',
    'directives.buttonTranslationKeys.getStarted': 'directives.formButtonValidation.gettingStarted',
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

  // Find the matching translation key for the button text
  findButtonTranslationKey(buttonText: string): string | null {
    // Clean the button text (remove extra whitespace)
    const cleanButtonText = buttonText.trim();

    // Check if the button text matches any of our translation keys
    for (const [translationKey, loadingKey] of Object.entries(this.loadingTextKeyMap)) {
      const translatedButtonText = this.translocoService.translate(translationKey);
      if (translatedButtonText === cleanButtonText) {
        return loadingKey;
      }
    }

    return null;
  }

  changeLoadingText(): void {
    if (this.loadingText) {
      this.selectedElement.innerHTML = `${this.loadingText}`;
    } else if (this.defaultText) {
      // Try to find a matching translation key for the button text
      const loadingKey = this.findButtonTranslationKey(this.defaultText);
      if (loadingKey) {
        this.selectedElement.innerHTML = `${this.translocoService.translate(loadingKey)}`;
      } else {
        this.selectedElement.innerHTML = this.defaultText;
      }
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
