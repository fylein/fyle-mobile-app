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
import { currentEouRes } from 'src/app/core/test-data/org-user.service.spec.data';

fdescribe('InvitedUserPage', () => {
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
    // const toastControllerSpy = jasmine.createSpyObj("ToastController");
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
    it('should set the fullname control value from eou$', fakeAsync(() => {
      component.eou$ = of(currentEouRes);
      component.fg.controls.fullName.setValue('Abhishek Jain');
      component.ngOnInit();
      tick(500);
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

    it('should emit the correct value to check for upperCase vadility', () => {
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

    it('should emit the correct value to check for number vadility', () => {
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

    it('should emit the correct value to check for lowerCase vadility', () => {
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

    it('should emit the correct value to check for lowerCase vadility', () => {
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
  xit('saveData', () => {});
});
