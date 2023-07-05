import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgUserSettingsService } from 'src/app/core/services/org-user-settings.service';
import { UserEventService } from 'src/app/core/services/user-event.service';
import { SecureStorageService } from 'src/app/core/services/secure-storage.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { DeviceService } from 'src/app/core/services/device.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TrackingService } from '../../core/services/tracking.service';
import { OrgService } from 'src/app/core/services/org.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { PopoverController } from '@ionic/angular';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { MyProfilePage } from './my-profile.page';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { postOrgUser } from 'src/app/core/test-data/org-user.service.spec.data';
import { of } from 'rxjs';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ActivatedRoute } from '@angular/router';
import { UpdateMobileNumberComponent } from './update-mobile-number/update-mobile-number.component';
import { PopupWithBulletsComponent } from 'src/app/shared/components/popup-with-bullets/popup-with-bullets.component';
import { allInfoCardsData } from 'src/app/core/mock-data/info-card-data.data';

describe('MyProfilePage', () => {
  let component: MyProfilePage;
  let fixture: ComponentFixture<MyProfilePage>;
  let authService: jasmine.SpyObj<AuthService>;
  let orgUserSettingsService: jasmine.SpyObj<OrgUserSettingsService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let secureStorageService: jasmine.SpyObj<SecureStorageService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let tokenService: jasmine.SpyObj<TokenService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let orgService: jasmine.SpyObj<OrgService>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarPropertiesService: jasmine.SpyObj<SnackbarPropertiesService>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MyProfilePage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(MyProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('setupNetworkWatcher', () => {});

  xit('signOut', () => {});

  xit('ionViewWillEnter', () => {});

  xit('reset', () => {});

  describe('setInfoCardsData(): ', () => {
    it('should show only email card for non USD orgs', () => {
      component.setInfoCardsData('INR');
      expect(component.infoCardsData).toEqual([allInfoCardsData[1]]);
    });

    it('should show both email and mobile number cards for USD orgs', () => {
      component.setInfoCardsData('USD');
      expect(component.infoCardsData).toEqual(allInfoCardsData);
    });
  });

  describe('showToastMessage(): ', () => {
    it('should show success snackbar with message', () => {
      const message = 'Profile saved successfully';
      const successToastProperties = {
        data: {
          icon: 'tick-square-filled',
          showCloseButton: true,
          message,
        },
        duration: 3000,
      };

      snackbarPropertiesService.setSnackbarProperties.and.returnValue(successToastProperties);
      component.showToastMessage(message, 'success');

      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...successToastProperties,
        panelClass: 'msb-success',
      });
      expect(snackbarPropertiesService.setSnackbarProperties).toHaveBeenCalledOnceWith(
        'success',
        { message },
        undefined
      );
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: message,
      });
    });

    it('should show error snackbar with message', () => {
      const message = 'Something went wrong';
      const failureToastProperties = {
        data: {
          icon: 'danger',
          showCloseButton: true,
          message,
        },
        duration: 3000,
      };

      snackbarPropertiesService.setSnackbarProperties.and.returnValue(failureToastProperties);
      component.showToastMessage(message, 'failure');

      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...failureToastProperties,
        panelClass: 'msb-failure',
      });
      expect(snackbarPropertiesService.setSnackbarProperties).toHaveBeenCalledOnceWith(
        'failure',
        { message },
        undefined
      );
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: message,
      });
    });

    it('should show content copied snackbar with message', () => {
      const message = 'Mobile number copied successfully';
      const successToastProperties = {
        data: {
          icon: 'success',
          showCloseButton: true,
          message,
        },
        duration: 3000,
      };

      snackbarPropertiesService.setSnackbarProperties.and.returnValue(successToastProperties);
      component.showToastMessage(message, 'success');

      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...successToastProperties,
        panelClass: 'msb-success',
      });
      expect(snackbarPropertiesService.setSnackbarProperties).toHaveBeenCalledOnceWith(
        'success',
        { message },
        'tick-circle-outline'
      );
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: message,
      });
    });
  });

  it('showSuccessPopover(): should show success popover', fakeAsync(() => {
    const popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
    popoverController.create.and.resolveTo(popoverSpy);
    popoverSpy.onWillDismiss.and.resolveTo();

    component.showSuccessPopover();
    tick(200);

    expect(popoverController.create).toHaveBeenCalledOnceWith({
      component: PopupWithBulletsComponent,
      componentProps: {
        title: 'Verification Successful',
        listHeader: 'Now you can:',
        listItems: [
          {
            icon: 'message',
            text: 'Message your receipts to Fyle at (302) 440-2921 and we will create an expense for you.',
            textToCopy: '(302) 440-2921',
          },
          {
            icon: 'fy-reimbursable',
            text: 'Standard messaging rates applicable',
          },
        ],
        ctaText: 'Got it',
      },
      cssClass: 'pop-up-in-center',
    });

    expect(popoverSpy.present).toHaveBeenCalledOnceWith();
    expect(popoverSpy.onWillDismiss).toHaveBeenCalledOnceWith();
  }));

  describe('verifyMobileNumber(): ', () => {
    let popoverSpy: jasmine.SpyObj<HTMLIonPopoverElement>;
    beforeEach(() => {
      popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.resolveTo(popoverSpy);
      spyOn(component.loadEou$, 'next');
      spyOn(component, 'showSuccessPopover');
      spyOn(component, 'showToastMessage');
      spyOn(component, 'updateMobileNumber');
      authService.refreshEou.and.returnValue(of(apiEouRes));
    });

    it('should show success popover if mobile number is verified', fakeAsync(() => {
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'SUCCESS', homeCurrency: 'USD' } });

      component.verifyMobileNumber(apiEouRes);
      tick(200);

      expect(popoverSpy.present).toHaveBeenCalledOnceWith();
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledOnceWith();
      expect(component.loadEou$.next).toHaveBeenCalledOnceWith(null);
      expect(component.showSuccessPopover).toHaveBeenCalledOnceWith();
    }));

    it('should show success toast message if mobile number is verified for non-USD org', fakeAsync(() => {
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'SUCCESS', homeCurrency: 'INR' } });

      component.verifyMobileNumber(apiEouRes);
      tick(200);

      expect(popoverSpy.present).toHaveBeenCalledOnceWith();
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledOnceWith();
      expect(component.loadEou$.next).toHaveBeenCalledOnceWith(null);
      expect(component.showToastMessage).toHaveBeenCalledOnceWith('Mobile Number Verified Successfully', 'success');
    }));

    it('should show mobile number popover if user clicks on back button', fakeAsync(() => {
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'BACK' } });

      component.verifyMobileNumber(apiEouRes);
      tick(200);

      expect(popoverSpy.present).toHaveBeenCalledOnceWith();
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledOnceWith();
      expect(component.updateMobileNumber).toHaveBeenCalled();
    }));
  });

  describe('updateMobileNumber(): ', () => {
    let popoverSpy: jasmine.SpyObj<HTMLIonPopoverElement>;
    beforeEach(() => {
      popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.returnValue(Promise.resolve(popoverSpy));

      authService.refreshEou.and.returnValue(of(apiEouRes));
      spyOn(component, 'showToastMessage');
      spyOn(component, 'verifyMobileNumber').and.resolveTo();
      spyOn(component.loadEou$, 'next');
    });

    it('should open edit number popover and show success toast message if update is successful', fakeAsync(() => {
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'SUCCESS' } });
      orgUserService.postOrgUser.and.returnValue(of(postOrgUser));

      component.updateMobileNumber(apiEouRes);
      tick(500);
      fixture.detectChanges();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: UpdateMobileNumberComponent,
        componentProps: {
          title: 'Edit Mobile Number',
          ctaText: 'Next',
          inputLabel: 'Mobile Number',
          extendedOrgUser: apiEouRes,
          placeholder: 'Enter mobile number e.g. +129586736556',
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(component.loadEou$.next).toHaveBeenCalledOnceWith(null);
      expect(component.verifyMobileNumber).toHaveBeenCalledOnceWith(apiEouRes);
      expect(component.showToastMessage).not.toHaveBeenCalled();
    }));

    it('should open add number popover and show error toast message if api returns error', fakeAsync(() => {
      popoverSpy.onWillDismiss.and.resolveTo({ data: { action: 'ERROR' } });

      const eouWithoutMobileNumber = {
        ...apiEouRes,
        ou: {
          ...apiEouRes.ou,
          mobile: null,
        },
      };

      component.updateMobileNumber(eouWithoutMobileNumber);
      tick(500);
      fixture.detectChanges();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: UpdateMobileNumberComponent,
        componentProps: {
          title: 'Add Mobile Number',
          ctaText: 'Next',
          inputLabel: 'Mobile Number',
          extendedOrgUser: eouWithoutMobileNumber,
          placeholder: 'Enter mobile number e.g. +129586736556',
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(popoverSpy.present).toHaveBeenCalledTimes(1);
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(orgUserService.postOrgUser).not.toHaveBeenCalled();
      expect(component.showToastMessage).toHaveBeenCalledOnceWith(
        'Something went wrong. Please try again later.',
        'failure'
      );
    }));
  });
});
