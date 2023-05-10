import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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
import { of } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIcon } from '@angular/material/icon';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

fdescribe('SetupAccountPage', () => {
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
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['updateOrg', 'setCurrencyBasedOnIp', 'getCurrentOrg']);
    const toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['postOrgUser']);
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

    networkService.connectivityWatcher.and.callThrough();
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

  xit('setupNetworkWatcher', () => {});
  xit('openCurrenySelectionModal', () => {});
  xit('postUser', () => {});
  xit('postOrg', () => {});
  xit('saveGuessedMileage', () => {});
  xit('saveData', () => {});
});
