import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { NetworkService } from 'src/app/core/services/network.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgService } from 'src/app/core/services/org.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { Router, RouterModule } from '@angular/router';
import { TrackingService } from '../../core/services/tracking.service';
import { SetupAccountPage } from './setup-account.page';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { first, of, take, toArray } from 'rxjs';
import { apiEouRes, eouRes3 } from 'src/app/core/mock-data/extended-org-user.data';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { SelectCurrencyComponent } from './select-currency/select-currency.component';
import { currentEouRes, postUserResponse } from 'src/app/core/test-data/org-user.service.spec.data';
import { orgSettingsGetData, orgSettingsPostData } from 'src/app/core/test-data/org-settings.service.spec.data';
import { cloneDeep } from 'lodash';

describe('SetupAccountPage', () => {
  let component: SetupAccountPage;
  let fixture: ComponentFixture<SetupAccountPage>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let authService: jasmine.SpyObj<AuthService>;
  let fb: FormBuilder;
  let modalController: jasmine.SpyObj<ModalController>;
  let orgService: jasmine.SpyObj<OrgService>;
  let toastController: jasmine.SpyObj<ToastController>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let router: jasmine.SpyObj<Router>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(waitForAsync(() => {
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou', 'refreshEou']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['updateOrg', 'setCurrencyBasedOnIp', 'getCurrentOrg']);
    const toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['postOrgUser', 'postUser']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get', 'post']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['setupHalf', 'updateSegmentProfile']);

    TestBed.configureTestingModule({
      declarations: [SetupAccountPage],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        RouterTestingModule,
        RouterModule,
        MatIconTestingModule,
        NoopAnimationsModule,
        MatInputModule,
      ],
      providers: [
        FormBuilder,
        { provide: NetworkService, useValue: networkServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: OrgService, useValue: orgServiceSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: OrgUserService, useValue: orgUserServiceSpy },
        { provide: OrgSettingsService, useValue: orgSettingsServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(SetupAccountPage);
    component = fixture.componentInstance;

    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fb = TestBed.inject(FormBuilder);
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    orgService = TestBed.inject(OrgService) as jasmine.SpyObj<OrgService>;
    toastController = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;

    networkService.connectivityWatcher.and.returnValue(new EventEmitter());
    networkService.isOnline.and.returnValue(of(true));
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));
    orgSettingsService.get.and.returnValue(of(orgSettingsRes));
    orgService.setCurrencyBasedOnIp.and.returnValue(of(orgData1[0]));

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('setupNetworkWatcher(): should setup the network watcher', fakeAsync(() => {
    networkService.isOnline.and.returnValue(of(true));
    const eventEmitterMock = new EventEmitter<boolean>();
    networkService.connectivityWatcher.and.returnValue(eventEmitterMock);

    component.setupNetworkWatcher();
    component.isConnected$.pipe(take(1)).subscribe((connectionStatus) => {
      expect(connectionStatus).toEqual(true);
    });
  }));

  it('openCurrenySelectionModal(): should open the currency select modal', fakeAsync(() => {
    const modalSpy = jasmine.createSpyObj('Modal', ['present', 'onWillDismiss']);
    modalController.create.and.returnValue(Promise.resolve(modalSpy));
    modalSpy.onWillDismiss.and.returnValue(Promise.resolve({ data: { currency: { shortCode: 'USD' } } }));

    component.openCurrenySelectionModal();
    fixture.detectChanges();
    tick(500);
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: SelectCurrencyComponent,
    });
    expect(modalSpy.present).toHaveBeenCalledTimes(1);
    expect(component.fg.controls.homeCurrency.value).toEqual('USD');
  }));

  it('postUser(): should update the password of the user', fakeAsync(() => {
    orgUserService.postUser.and.returnValue(of(postUserResponse));
    component.eou$ = of(currentEouRes);
    component.fg.controls.password.setValue('qwerty@123456');
    const updatedEou = {
      id: 'usvKA4X8Ugcr',
      created_at: new Date('2016-06-13T12:21:16.803Z'),
      full_name: 'Abhishek Jain',
      email: 'ajain@fyle.in',
      email_verified_at: new Date('2022-09-06T05:26:19.898Z'),
      onboarded: true,
      password: 'qwerty@123456',
    };
    component.postUser().subscribe(() => {
      expect(orgUserService.postUser).toHaveBeenCalledOnceWith(updatedEou);
      expect(currentEouRes.us).toEqual(updatedEou);
    });
  }));

  it('postOrg(): should update the company name and the homecurrency and return the updated data', fakeAsync(() => {
    const orgData = cloneDeep(orgData1[0]);
    component.org$ = of(orgData);
    orgService.updateOrg.and.returnValue(of(orgData));
    component.fg.controls.companyName.setValue('Uber');
    component.fg.controls.homeCurrency.setValue('USD');

    const expectedorgData1 = {
      ...orgData1[0],
      name: 'Uber',
      currency: 'USD',
    };
    component.postOrg().subscribe(() => {
      expect(orgData).toEqual(expectedorgData1);
      expect(orgService.updateOrg).toHaveBeenCalledOnceWith(expectedorgData1);
    });
  }));

  describe('saveGuessedMileage():', () => {
    it('should set the desired mileage value if the org currency is USD', fakeAsync(() => {
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      component.org$ = of(orgData1[0]);
      orgSettingsService.post.and.returnValue(of(orgSettingsPostData));
      component.saveGuessedMileage().subscribe(() => {
        expect(orgSettingsRes.mileage.four_wheeler).toBe(0.58);
        expect(orgSettingsRes.mileage.unit).toBe('MILES');
        expect(orgSettingsRes.mileage.enabled).toBe(true);
        expect(orgSettingsRes.mileage.two_wheeler).toBe(0.58);
      });
      expect(orgSettingsService.post).toHaveBeenCalledOnceWith(orgSettingsRes);
    }));

    it('should set the desired mileage value if the org currency is not USD', fakeAsync(() => {
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      const orgData12 = {
        ...orgData1[0],
        currency: 'INR',
      };
      component.org$ = of(orgData12);
      orgSettingsService.post.and.returnValue(of(orgSettingsPostData));
      component.saveGuessedMileage().subscribe(() => {
        fixture.detectChanges();
        expect(orgSettingsRes.mileage.four_wheeler).toBe(8.0);
        expect(orgSettingsRes.mileage.unit).toBe('KM');
        expect(orgSettingsRes.mileage.enabled).toBe(true);
        expect(orgSettingsRes.mileage.two_wheeler).toBe(6.0);
      });
      tick(500);
      expect(orgSettingsService.post).toHaveBeenCalledOnceWith(orgSettingsRes);
    }));
  });

  describe('saveData():', () => {
    it('should navigate to setup_account_preferences when form is valid', fakeAsync(() => {
      spyOn(component.fg, 'markAllAsTouched');
      spyOn(component, 'postUser').and.returnValue(of(postUserResponse));
      spyOn(component, 'postOrg').and.returnValue(of(orgData1[0]));
      spyOn(component, 'saveGuessedMileage').and.returnValue(of(orgSettingsRes));
      loaderService.showLoader.and.returnValue(Promise.resolve());
      loaderService.hideLoader.and.returnValue(Promise.resolve());
      authService.refreshEou.and.returnValue(of(eouRes3));
      component.fg.setValue({
        companyName: 'Acme Inc.',
        homeCurrency: 'USD',
        password: 'StrongPassword@123',
      });
      component.saveData();
      fixture.detectChanges();
      tick(500);
      expect(component.fg.markAllAsTouched).toHaveBeenCalledTimes(1);
      expect(component.fg.valid).toBe(true);
      expect(loaderService.showLoader).toHaveBeenCalledTimes(1);
      expect(component.postUser).toHaveBeenCalledTimes(1);
      expect(component.postOrg).toHaveBeenCalledTimes(1);
      expect(component.saveGuessedMileage).toHaveBeenCalledTimes(1);
      expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
      tick(500);
      expect(trackingService.setupHalf).toHaveBeenCalledTimes(1);
      expect(trackingService.updateSegmentProfile).toHaveBeenCalledOnceWith({ 'Company Name': 'Acme Inc.' });
      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'post_verification', 'setup_account_preferences']);
    }));

    it('should display a toast message when form is invalid', fakeAsync(() => {
      spyOn(component.fg, 'markAllAsTouched');
      component.fg.setValue({
        companyName: '',
        homeCurrency: '',
        password: '',
      });

      const toastSpy = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
      toastSpy.present.and.returnValue(Promise.resolve());
      toastController.create.and.returnValue(Promise.resolve(toastSpy));
      component.saveData();
      fixture.detectChanges();
      tick(500);
      expect(component.fg.markAllAsTouched).toHaveBeenCalledTimes(1);
      expect(component.fg.valid).toBe(false);
      expect(toastController.create).toHaveBeenCalledOnceWith({
        message: 'Please fill all required fields to proceed',
        color: 'danger',
        duration: 1200,
      });
    }));
  });

  describe('onInit()', () => {
    it('should check if newtwokWatcher is called', fakeAsync(() => {
      spyOn(component, 'setupNetworkWatcher');
      component.ngOnInit();
      fixture.detectChanges();
      tick(500);
      expect(component.setupNetworkWatcher).toHaveBeenCalledTimes(1);
    }));

    it('should check if eou$ was called and the appropriate fullname was obtained', fakeAsync(() => {
      component.eou$ = of(currentEouRes);
      expect(authService.getEou).toHaveBeenCalledTimes(1);
      component.fullname$.subscribe((res) => {
        expect(res).toBe(currentEouRes.us.full_name);
      });
    }));

    it('should set the homeCurrency control value from org$', fakeAsync(() => {
      const orgData = cloneDeep(orgData1[0]);
      const org = { currency: 'USD' };
      orgService.setCurrencyBasedOnIp.and.returnValue(of(orgData));
      orgService.getCurrentOrg.and.returnValue(of(orgData));
      expect(orgService.setCurrencyBasedOnIp).toHaveBeenCalledTimes(1);
      expect(orgService.getCurrentOrg).toHaveBeenCalledTimes(1);
      component.org$.subscribe(() => {
        expect(component.fg.controls.homeCurrency.value).toBe(org.currency);
      });
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

    it('should emit the correct value to check for special characters in the password', () => {
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
});
