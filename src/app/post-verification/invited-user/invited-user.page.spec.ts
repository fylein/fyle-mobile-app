import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { NetworkService } from 'src/app/core/services/network.service';
import { ToastController } from '@ionic/angular';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { TrackingService } from '../../core/services/tracking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { InvitedUserPage } from './invited-user.page';
import { FormBuilder } from '@angular/forms';
import { of, take } from 'rxjs';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  currentEouRes,
  extendedOrgUserResponse,
  postUserResponse,
} from 'src/app/core/test-data/org-user.service.spec.data';
import { cloneDeep } from 'lodash';
import { eouRes3 } from 'src/app/core/mock-data/extended-org-user.data';
import { OrgService } from 'src/app/core/services/org.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';

describe('InvitedUserPage', () => {
  let component: InvitedUserPage;
  let fixture: ComponentFixture<InvitedUserPage>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let fb: FormBuilder;
  let toastController: jasmine.SpyObj<ToastController>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;

  beforeEach(waitForAsync(() => {
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['postUser', 'markActive']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou', 'refreshEou']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'showToastMessage',
      'setupComplete',
      'activated',
    ]);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    TestBed.configureTestingModule({
      declarations: [InvitedUserPage],
      imports: [IonicModule.forRoot(), MatIconTestingModule],
      providers: [
        FormBuilder,
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: ToastController, useValue: toastController },
        { provide: OrgUserService, useValue: orgUserServiceSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    fb = TestBed.inject(FormBuilder);
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;

    networkService.connectivityWatcher.and.returnValue(new EventEmitter());
    networkService.isOnline.and.returnValue(of(true));
    authService.getEou.and.returnValue(Promise.resolve(currentEouRes));
    fixture = TestBed.createComponent(InvitedUserPage);
    component = fixture.componentInstance;
    component.isConnected$ = of(true);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onInit()', () => {
    it('should set the fullname value from eou$ and setup network watcher', fakeAsync(() => {
      networkService.isOnline.and.returnValue(of(true));
      const eventEmitterMock = new EventEmitter<boolean>();
      networkService.connectivityWatcher.and.returnValue(eventEmitterMock);
      component.eou$ = of(currentEouRes);
      component.fg.controls.fullName.setValue('Abhishek Jain');
      component.ngOnInit();
      tick(500);
      component.isConnected$.pipe(take(1)).subscribe((connectionStatus) => {
        expect(connectionStatus).toEqual(true);
      });
      expect(component.fg.controls.fullName.value).toEqual(currentEouRes.us.full_name);
    }));

    it('should emit the correct length validation display value when the password value changes', () => {
      const testCases = [
        { input: 'qwert', expectedOutput: false },
        { input: 'John_doe123@fyle', expectedOutput: true },
        { input: 'Thisisaveryverylong12345@password', expectedOutput: false },
      ];
      testCases.forEach((testCase) => {
        component.lengthValidationDisplay$.pipe(take(1)).subscribe((value) => {
          expect(value).toEqual(testCase.expectedOutput);
        });
        component.fg.controls.password.patchValue(testCase.input);
      });
    });

    it('should emit the correct value to check for upper case validity', () => {
      const testCases = [
        { input: 'qwert', expectedOutput: false },
        { input: '1234@abcd', expectedOutput: false },
        { input: 'John_doe123@fyle', expectedOutput: true },
      ];
      testCases.forEach((testCase) => {
        component.uppercaseValidationDisplay$.pipe(take(1)).subscribe((value) => {
          expect(value).toEqual(testCase.expectedOutput);
        });
        component.fg.controls.password.patchValue(testCase.input);
      });
    });

    it('should emit the correct value to check for number validity', () => {
      const testCases = [
        { input: 'qwert', expectedOutput: false },
        { input: 'John_doe123@fyle', expectedOutput: true },
      ];
      testCases.forEach((testCase) => {
        component.numberValidationDisplay$.pipe(take(1)).subscribe((value) => {
          expect(value).toEqual(testCase.expectedOutput);
        });
        component.fg.controls.password.patchValue(testCase.input);
      });
    });

    it('should emit the correct value to check for lower case validity', () => {
      const testCases = [
        { input: 'PASSWORD_123', expectedOutput: false },
        { input: 'John_doe123@fyle', expectedOutput: true },
      ];
      testCases.forEach((testCase) => {
        component.lowercaseValidationDisplay$.pipe(take(1)).subscribe((value) => {
          expect(value).toEqual(testCase.expectedOutput);
        });
        component.fg.controls.password.patchValue(testCase.input);
      });
    });

    it('should emit the correct value to check for special characters', () => {
      const testCases = [
        { input: 'Password123', expectedOutput: false },
        { input: 'John_doe123@fyle', expectedOutput: true },
      ];
      testCases.forEach((testCase) => {
        component.specialCharValidationDisplay$.pipe(take(1)).subscribe((value) => {
          expect(value).toEqual(testCase.expectedOutput);
        });
        component.fg.controls.password.patchValue(testCase.input);
      });
    });
  });

  describe('saveData', () => {
    it('should navigate to dashboard when form fields are valid', fakeAsync(() => {
      spyOn(component.fg, 'markAllAsTouched');
      component.fg.controls.fullName.setValue('John Doe');
      component.fg.controls.password.setValue('StrongPassword@123');
      component.eou$ = of(cloneDeep(currentEouRes));
      loaderService.showLoader.and.returnValue(Promise.resolve());
      loaderService.hideLoader.and.returnValue(Promise.resolve());
      authService.refreshEou.and.returnValue(of(eouRes3));
      orgUserService.postUser.and.returnValue(of(postUserResponse));
      orgUserService.markActive.and.returnValue(of(extendedOrgUserResponse));

      const updatedEou = {
        ...currentEouRes,
        us: {
          ...currentEouRes.us,
          full_name: 'John Doe',
          password: 'StrongPassword@123',
        },
      };

      component.saveData();
      fixture.detectChanges();
      tick(500);
      expect(component.fg.markAllAsTouched).toHaveBeenCalledTimes(1);
      expect(component.fg.valid).toBe(true);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);

      component.eou$.subscribe((exOrgUser) => {
        expect(exOrgUser.us).toEqual(updatedEou.us);
        expect(orgUserService.postUser).toHaveBeenCalledOnceWith(updatedEou.us);
      });
      expect(trackingService.setupComplete).toHaveBeenCalledTimes(1);
      expect(authService.refreshEou).toHaveBeenCalledTimes(1);
      expect(orgUserService.markActive).toHaveBeenCalledTimes(1);
      expect(trackingService.activated).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
      tick(500);
    }));

    it('should show error snackbar  when password is invalid', fakeAsync(() => {
      spyOn(component.fg, 'markAllAsTouched');
      component.fg.controls.fullName.setValue('John Doe');
      component.fg.controls.password.setValue('');
      const message = 'Please enter a valid password';

      component.saveData();
      tick(500);
      expect(component.fg.markAllAsTouched).toHaveBeenCalledTimes(1);
      expect(component.fg.valid).toBe(false);
      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...snackbarProperties.setSnackbarProperties('failure', { message }),
        panelClass: ['msb-failure'],
      });
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: message });
    }));

    it('should show error snackbar when name is invalid', fakeAsync(() => {
      spyOn(component.fg, 'markAllAsTouched');
      component.fg.controls.fullName.setValue('');
      component.fg.controls.password.setValue('StrongPassword@123');
      const message = 'Please enter a valid name';

      component.saveData();
      tick(500);
      expect(component.fg.markAllAsTouched).toHaveBeenCalledTimes(1);
      expect(component.fg.valid).toBe(false);
      expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
        ...snackbarProperties.setSnackbarProperties('failure', { message }),
        panelClass: ['msb-failure'],
      });
      expect(trackingService.showToastMessage).toHaveBeenCalledOnceWith({ ToastContent: message });
    }));
  });
});
