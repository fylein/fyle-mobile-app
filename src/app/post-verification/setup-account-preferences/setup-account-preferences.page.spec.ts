import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { NetworkService } from 'src/app/core/services/network.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgService } from 'src/app/core/services/org.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { Router, RouterModule } from '@angular/router';
import { TrackingService } from '../../core/services/tracking.service';
import { SetupAccountPreferencesPage } from './setup-account-preferences.page';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { orgData1 } from 'src/app/core/mock-data/org.data';
import { orgSettingsRes } from 'src/app/core/mock-data/org-settings.data';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { OrgSettings } from 'src/app/core/models/org-settings.model';
import { cloneDeep } from 'lodash';

describe('SetupAccountPreferencesPage', () => {
  let component: SetupAccountPreferencesPage;
  let fixture: ComponentFixture<SetupAccountPreferencesPage>;
  let networkService: jasmine.SpyObj<NetworkService>;
  let authService: jasmine.SpyObj<AuthService>;
  let orgService: jasmine.SpyObj<OrgService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let fb: FormBuilder;
  let loadingService: jasmine.SpyObj<LoaderService>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let router: jasmine.SpyObj<Router>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let mockOrgSettingsRes: OrgSettings;

  beforeEach(waitForAsync(() => {
    const networkServiceSpy = jasmine.createSpyObj('NetworkService', ['connectivityWatcher', 'isOnline']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['getCurrentOrg']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get', 'post']);
    const loadingServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['markActive']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'updateSegmentProfile',
      'setupComplete',
      'activated',
    ]);

    TestBed.configureTestingModule({
      declarations: [SetupAccountPreferencesPage],
      imports: [IonicModule.forRoot(), ReactiveFormsModule, RouterTestingModule, RouterModule],
      providers: [
        FormBuilder,
        {
          provide: NetworkService,
          useValue: networkServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: OrgService,
          useValue: orgServiceSpy,
        },
        {
          provide: LoaderService,
          useValue: loadingServiceSpy,
        },
        {
          provide: OrgUserService,
          useValue: orgUserServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SetupAccountPreferencesPage);
    component = fixture.componentInstance;

    networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    orgService = TestBed.inject(OrgService) as jasmine.SpyObj<OrgService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fb = TestBed.inject(FormBuilder);
    loadingService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;

    networkService.connectivityWatcher.and.callThrough();
    networkService.isOnline.and.returnValue(of(true));
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));
    mockOrgSettingsRes = cloneDeep(orgSettingsRes);
    orgSettingsService.get.and.returnValue(of(mockOrgSettingsRes));
    fixture.detectChanges();
  }));
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check if information is displayed correctly', () => {
    expect(getTextContent(getElementBySelector(fixture, '.setup-account-preferences--full-name'))).toEqual(
      'Staging Loaded'
    );
  });

  it('continueEnterprise', async () => {
    orgSettingsService.post.and.returnValue(of(orgSettingsRes));
    spyOn(component, 'markActiveAndRedirect').and.returnValue(null);
    trackingService.updateSegmentProfile.and.callThrough();

    component.fg = fb.group({
      mileage: [true],
      per_diem: [false],
      ccc: [true],
      advances: [true],
    });
    fixture.detectChanges();

    component.continueEnterprise();
    expect(orgSettingsService.post).toHaveBeenCalledOnceWith(mockOrgSettingsRes);
    expect(component.markActiveAndRedirect).toHaveBeenCalledTimes(1);
    expect(trackingService.updateSegmentProfile).toHaveBeenCalledOnceWith({
      'Enable Mileage': component.fg.controls.mileage.value,
      'Enable Per Diem': component.fg.controls.per_diem.value,
      'Enable Corporate Cards': component.fg.controls.ccc.value,
      'Enable Advances': component.fg.controls.advances.value,
    });
  });

  it('markActiveAndRedirect', fakeAsync(() => {
    loadingService.showLoader.and.returnValue(Promise.resolve());
    loadingService.hideLoader.and.returnValue(Promise.resolve());
    trackingService.setupComplete.and.callThrough();
    orgUserService.markActive.and.returnValue(of(apiEouRes));
    trackingService.activated.and.callThrough();
    spyOn(router, 'navigate');
    component.markActiveAndRedirect();

    tick();
    expect(loadingService.hideLoader).toHaveBeenCalledTimes(1);
    expect(loadingService.showLoader).toHaveBeenCalledTimes(1);
    expect(trackingService.setupComplete).toHaveBeenCalledTimes(1);
    expect(orgUserService.markActive).toHaveBeenCalledTimes(1);
    expect(trackingService.activated).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard']);
  }));

  it('should continue to enterprise page when click on', () => {
    spyOn(component, 'continueEnterprise');

    const finishButton = getElementBySelector(fixture, '.setup-account-preferences--primary-cta') as HTMLElement;

    click(finishButton);
    expect(component.continueEnterprise).toHaveBeenCalledTimes(1);
  });
});
