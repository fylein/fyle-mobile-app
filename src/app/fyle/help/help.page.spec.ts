import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { TrackingService } from '../../core/services/tracking.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { HelpPage } from './help.page';
import { SupportDialogPage } from './support-dialog/support-dialog.page';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { of } from 'rxjs';
import { employeesRes } from 'src/app/core/test-data/org-user.service.spec.data';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserHandlerService } from 'src/app/core/services/browser-handler.service';

describe('HelpPage', () => {
  let component: HelpPage;
  let fixture: ComponentFixture<HelpPage>;
  let modalController: jasmine.SpyObj<ModalController>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let authService: jasmine.SpyObj<AuthService>;
  let browserHandlerService: jasmine.SpyObj<BrowserHandlerService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['getEmployeesByParams']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['viewHelpCard']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const browserHandlerServiceSpy = jasmine.createSpyObj('BrowserHandlerService', ['openLinkWithToolbarColor']);

    TestBed.configureTestingModule({
      declarations: [HelpPage],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: OrgUserService,
          useValue: orgUserServiceSpy,
        },
        {
          provide: LoaderService,
          useValue: loaderServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: BrowserHandlerService,
          useValue: browserHandlerServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    fixture = TestBed.createComponent(HelpPage);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    browserHandlerService = TestBed.inject(BrowserHandlerService) as jasmine.SpyObj<BrowserHandlerService>;

    component.orgAdmins = employeesRes;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openContactSupportDialog(): should open contact support dialog', fakeAsync(() => {
    const dialogType = 'contact_support';
    const params = {
      select: 'us_full_name,us_email',
      ou_org_id: 'eq.orNVthTo2Zyo',
      ou_roles: 'like.%ADMIN%',
      ou_status: 'eq."ACTIVE"',
      ou_id: 'not.eq.ouX8dwsbLCLv',
      order: 'us_full_name.asc,ou_id',
      limit: 5,
    };

    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
    spyOn(component, 'presentSupportModal');
    authService.getEou.and.resolveTo(apiEouRes);
    orgUserService.getEmployeesByParams.and.returnValue(of(employeesRes));

    component.openContactSupportDialog();
    tick(500);
    expect(component.contactSupportLoading).toBeTrue();
    expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Please wait', 10000);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(orgUserService.getEmployeesByParams).toHaveBeenCalledOnceWith(params);
    expect(component.orgAdmins).toEqual(employeesRes.data);
    expect(component.presentSupportModal).toHaveBeenCalledWith(dialogType);
  }));

  it('openLogMileageDialog', () => {
    spyOn(component, 'presentSupportModal');
    component.openLogMileageDialog();
    expect(component.presentSupportModal).toHaveBeenCalledWith('log_mileage');
  });

  it('openCaptureEmailReceiptsDialog', () => {
    spyOn(component, 'presentSupportModal');
    component.openCaptureEmailReceiptsDialog();
    expect(component.presentSupportModal).toHaveBeenCalledWith('capture_email');
  });

  describe('presentSupportModal', () => {
    it('should open present support modal when the dialog type is contact_support and when data is present', fakeAsync(() => {
      const dialogType = 'contact_support';
      component.orgAdmins = employeesRes;
      const modalControllerSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
      modalController.create.and.returnValue(modalControllerSpy);
      modalControllerSpy.onDidDismiss.and.resolveTo({ data: { dismissed: true } } as any);
      component.presentSupportModal(dialogType);
      tick(500);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: SupportDialogPage,
        componentProps: {
          type: dialogType,
          adminEous: employeesRes,
        },
      });
      expect(modalControllerSpy.present).toHaveBeenCalledTimes(1);
      expect(modalControllerSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(component.contactSupportLoading).toBeFalse();
    }));

    it('should open present support modal when the dialog type is not contact_support and when data is not present', fakeAsync(() => {
      const dialogType = 'capture_email';
      component.orgAdmins = employeesRes;
      const modalControllerSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
      modalController.create.and.returnValue(modalControllerSpy);
      modalControllerSpy.onDidDismiss.and.resolveTo({ data: null });
      component.presentSupportModal(dialogType);
      tick(500);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: SupportDialogPage,
        componentProps: {
          type: dialogType,
          adminEous: employeesRes,
        },
      });
      expect(modalControllerSpy.present).toHaveBeenCalledTimes(1);
      expect(modalControllerSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(component.contactSupportLoading).toBeFalse();
    }));
  });

  it('openHelpLink', () => {
    const url = 'https://help.fylehq.com';
    const toolbarColor = '#280a31';
    component.openHelpLink();
    expect(browserHandlerService.openLinkWithToolbarColor).toHaveBeenCalledOnceWith(toolbarColor, url);
  });
});
