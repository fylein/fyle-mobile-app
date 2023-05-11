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
import { of, throwError } from 'rxjs';
import { FyInputPopoverComponent } from 'src/app/shared/components/fy-input-popover/fy-input-popover.component';
import { HttpErrorResponse } from '@angular/common/http';

fdescribe('MyProfilePage', () => {
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
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou', 'refreshEou', 'logout']);
    const orgUserSettingsServiceSpy = jasmine.createSpyObj('OrgUserSettingsService', ['get', 'post']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['logout']);
    const secureStorageServiceSpy = jasmine.createSpyObj('SecureStorageService', ['clearAll']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['clearAll']);
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getDeviceInfo']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getClusterDomain']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['onSettingsToggle', 'showToastMessage']);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['getCurrentOrg']);
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['postOrgUser']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);

    TestBed.configureTestingModule({
      declarations: [MyProfilePage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: OrgUserSettingsService, useValue: orgUserSettingsServiceSpy },
        { provide: UserEventService, useValue: userEventServiceSpy },
        { provide: SecureStorageService, useValue: secureStorageServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: OrgService, useValue: orgServiceSpy },
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: OrgUserService, useValue: orgUserServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    orgUserSettingsService = TestBed.inject(OrgUserSettingsService) as jasmine.SpyObj<OrgUserSettingsService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    secureStorageService = TestBed.inject(SecureStorageService) as jasmine.SpyObj<SecureStorageService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    orgService = TestBed.inject(OrgService) as jasmine.SpyObj<OrgService>;
    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarPropertiesService = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;

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

  describe('updateMobileNumber(): ', () => {
    let popoverSpy: jasmine.SpyObj<HTMLIonPopoverElement>;
    beforeEach(() => {
      popoverSpy = jasmine.createSpyObj('HTMLIonPopoverElement', ['present', 'onWillDismiss']);
      popoverController.create.and.returnValue(Promise.resolve(popoverSpy));
      popoverSpy.onWillDismiss.and.returnValue(Promise.resolve({ data: { newValue: '900900900' } }));

      authService.refreshEou.and.returnValue(of(apiEouRes));
      spyOn(component, 'showToastMessage');
    });

    it('should open edit number popover and show success toast message if update is successful', fakeAsync(() => {
      orgUserService.postOrgUser.and.returnValue(of(postOrgUser));

      component.updateMobileNumber(apiEouRes);
      tick(1000);
      fixture.detectChanges();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: FyInputPopoverComponent,
        componentProps: {
          title: 'Edit Mobile Number',
          ctaText: 'Save',
          inputLabel: 'Mobile Number',
          inputValue: apiEouRes.ou.mobile,
          inputType: 'tel',
          isRequired: false,
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(orgUserService.postOrgUser).toHaveBeenCalledOnceWith({ ...apiEouRes.ou, mobile: '900900900' });
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(component.showToastMessage).toHaveBeenCalledOnceWith('Profile saved successfully', 'success');
    }));

    it('should open add number popover and show error toast message if api returns error', fakeAsync(() => {
      orgUserService.postOrgUser.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

      const eouWithoutMobileNumber = {
        ...apiEouRes,
        ou: {
          ...apiEouRes.ou,
          mobile: null,
        },
      };

      component.updateMobileNumber(eouWithoutMobileNumber);
      tick(1000);
      fixture.detectChanges();

      expect(popoverController.create).toHaveBeenCalledOnceWith({
        component: FyInputPopoverComponent,
        componentProps: {
          title: 'Add Mobile Number',
          ctaText: 'Save',
          inputLabel: 'Mobile Number',
          inputValue: eouWithoutMobileNumber.ou.mobile,
          inputType: 'tel',
          isRequired: false,
        },
        cssClass: 'fy-dialog-popover',
      });
      expect(popoverSpy.onWillDismiss).toHaveBeenCalledTimes(1);
      expect(orgUserService.postOrgUser).toHaveBeenCalledOnceWith({
        ...eouWithoutMobileNumber.ou,
        mobile: '900900900',
      });
      expect(authService.refreshEou).not.toHaveBeenCalled();
      expect(component.showToastMessage).toHaveBeenCalledOnceWith(
        'Something went wrong. Please try again later.',
        'failure'
      );
    }));
  });

  describe('showToastMessage(): ', () => {
    it('should show success snackbar with mesage', () => {
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
      expect(snackbarPropertiesService.setSnackbarProperties).toHaveBeenCalledOnceWith('success', { message });
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
      expect(snackbarPropertiesService.setSnackbarProperties).toHaveBeenCalledOnceWith('failure', { message });
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({
        ToastContent: message,
      });
    });
  });
});
