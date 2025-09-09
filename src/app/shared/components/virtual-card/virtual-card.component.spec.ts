import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';

import { VirtualCardComponent } from './virtual-card.component';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { click, getElementBySelector } from 'src/app/core/dom-helpers';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { of } from 'rxjs';

describe('VirtualCardComponent', () => {
  let component: VirtualCardComponent;
  let fixture: ComponentFixture<VirtualCardComponent>;
  let clipboardService: jasmine.SpyObj<ClipboardService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const clipboardServiceSpy = jasmine.createSpyObj('ClipboardService', ['writeString']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), TranslocoModule, VirtualCardComponent],
    providers: [
        { provide: ClipboardService, useValue: clipboardServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
    ],
}).compileComponents();

    fixture = TestBed.createComponent(VirtualCardComponent);
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    clipboardService = TestBed.inject(ClipboardService) as jasmine.SpyObj<ClipboardService>;
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'virtualCard.preActive': 'Pre-Active',
        'virtualCard.cvv': 'CVV',
        'virtualCard.expiry': 'Expiry',
        'virtualCard.available': 'Available',
        'virtualCard.copiedSuccessfully': 'Copied Successfully!',
        'virtualCard.availableMonthlyLimit': 'Available monthly limit',
        'virtualCard.availableLimitMessage': 'Available limit on this card for the current month.',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('copyToClipboard(): ', () => {
    it('should copy content to clipboard and trigger toast message', fakeAsync(() => {
      spyOn(component, 'copyToClipboard').and.callThrough();
      clipboardService.writeString.and.resolveTo();
      component.copyToClipboard('1234');

      expect(component.copyToClipboard).toHaveBeenCalledOnceWith('1234');
      expect(clipboardService.writeString).toHaveBeenCalledOnceWith('1234');
    }));

    it('should copy cvv on cvv copy icon tap', () => {
      component.cvv = '1234';
      const cvvCopyIcon = getElementBySelector(fixture, '.virtual-card__card-fields__cvv-copy-icon');
      const tapSpy = spyOn(component, 'copyToClipboard');

      cvvCopyIcon.dispatchEvent(new Event('tap'));

      expect(tapSpy).toHaveBeenCalledOnceWith(component.cvv);
    });
  });

  it('showToastMessage(): Should show toast message', () => {
    const message = 'Copied Successfully!';
    const successToastProperties = {
      data: {
        icon: 'check-circle-outline',
        showCloseButton: true,
        message,
      },
      duration: 3000,
    };

    snackbarProperties.setSnackbarProperties.and.returnValue(successToastProperties);
    component.showToastMessage(message);

    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      ...successToastProperties,
      panelClass: 'msb-success',
    });

    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith(
      'success',
      { message },
      'check-circle-outline'
    );
  });

  describe('template', () => {
    it('should hide cvv and call method to copy text to clipboard', () => {
      component.cvv = '1234';
      component.showCvv = true;
      const cvvCopyIcon = getElementBySelector(fixture, '.virtual-card__card-fields__cvv-copy-icon');
      const hideCvvAndCopySpy = spyOn(component, 'hideCvvAndCopy');
      cvvCopyIcon.dispatchEvent(new Event('pressup'));

      expect(hideCvvAndCopySpy).toHaveBeenCalledTimes(1);
    });

    it('should hide cvv and call method to copy text to clipboard', () => {
      component.cardNumber = '123451234512345';
      component.showCardNumber = true;
      const cardNumberCopyIcon = getElementBySelector(fixture, '.virtual-card__card-number__copy-icon');
      const hideCardNumberAndCopy = spyOn(component, 'hideCardNumberAndCopy');
      cardNumberCopyIcon.dispatchEvent(new Event('pressup'));

      expect(hideCardNumberAndCopy).toHaveBeenCalledTimes(1);
    });
  });

  it('hideCvvAndCopy(): should hide cvv and call method to copy text to clipboard', fakeAsync(() => {
    component.cvv = '1234';
    component.showCvv = true;
    const copyToClipboardSpy = spyOn(component, 'copyToClipboard');

    component.hideCvvAndCopy();

    tick(1000);

    expect(component.showCvv).toBeFalse();
    expect(copyToClipboardSpy).toHaveBeenCalledOnceWith(component.cvv);
  }));

  it('hideCardNumberAndCopy(): should hide cvv and call method to copy text to clipboard', fakeAsync(() => {
    component.cardNumber = '123451234512345';
    component.showCardNumber = true;
    const copyToClipboardSpy = spyOn(component, 'copyToClipboard');

    component.hideCardNumberAndCopy();

    tick(1000);

    expect(component.showCardNumber).toBeFalse();
    expect(copyToClipboardSpy).toHaveBeenCalledOnceWith(component.cardNumber);
  }));

  it('toggleShowCardNumber(): should show card number if card number is hidden', () => {
    component.showCardNumber = false;
    component.toggleShowCardNumber();
    expect(component.showCardNumber).toBeTrue();
  });

  it('toggleShowCvv(): should show card number if card number is hidden', () => {
    component.showCvv = false;
    component.toggleShowCvv();
    expect(component.showCvv).toBeTrue();
  });
});
