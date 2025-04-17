import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
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
  let employeesService: jasmine.SpyObj<EmployeesService>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let authService: jasmine.SpyObj<AuthService>;
  let browserHandlerService: jasmine.SpyObj<BrowserHandlerService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const employeesServiceSpy = jasmine.createSpyObj('EmployeesService', ['getEmployeesByParams']);
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
          provide: EmployeesService,
          useValue: employeesServiceSpy,
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
    employeesService = TestBed.inject(EmployeesService) as jasmine.SpyObj<EmployeesService>;
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
      select: '(full_name,email)',
      roles: 'like.%ADMIN%',
      is_enabled: 'eq.true',
      has_accepted_invite: 'eq.true',
      id: 'neq.ouX8dwsbLCLv',
      order: 'full_name.asc',
      limit: 5,
    };

    loaderService.showLoader.and.resolveTo();
    loaderService.hideLoader.and.resolveTo();
    spyOn(component, 'presentSupportModal');
    authService.getEou.and.resolveTo(apiEouRes);
    employeesService.getEmployeesByParams.and.returnValue(of(employeesRes));

    component.openContactSupportDialog();
    tick(500);
    expect(component.contactSupportLoading).toBeTrue();
    expect(loaderService.showLoader).toHaveBeenCalledOnceWith('Please wait', 10000);
    expect(authService.getEou).toHaveBeenCalledTimes(1);
    expect(employeesService.getEmployeesByParams).toHaveBeenCalledOnceWith(params);
    expect(loaderService.hideLoader).toHaveBeenCalledTimes(1);
    expect(component.orgAdmins).toEqual(employeesRes);
    expect(component.presentSupportModal).toHaveBeenCalledWith(dialogType);
  }));

  describe('presentSupportModal():', () => {
    it('should open present support modal when the dialog type is contact_support and when data is present', fakeAsync(() => {
      const dialogType = 'contact_support';
      component.orgAdmins = employeesRes;
      const modalControllerSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
      modalController.create.and.returnValue(modalControllerSpy);
      modalControllerSpy.onDidDismiss.and.resolveTo({ data: { dismissed: true } } as any);
      component.presentSupportModal(dialogType);
      tick(500);
      expect(trackingService.viewHelpCard).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: SupportDialogPage,
        componentProps: {
          type: dialogType,
          adminEous: employeesRes.data,
        },
      });
      expect(modalControllerSpy.present).toHaveBeenCalledTimes(1);
      expect(modalControllerSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(component.contactSupportLoading).toBeFalse();
    }));

    it('should open present support modal when the dialog type is not contact_support and when no data is present', fakeAsync(() => {
      const dialogType = 'capture_email';
      component.orgAdmins = employeesRes;
      const modalControllerSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
      modalController.create.and.returnValue(modalControllerSpy);
      modalControllerSpy.onDidDismiss.and.resolveTo({ data: null });
      component.presentSupportModal(dialogType);
      tick(500);
      expect(trackingService.viewHelpCard).toHaveBeenCalledTimes(1);
      expect(modalController.create).toHaveBeenCalledOnceWith({
        component: SupportDialogPage,
        componentProps: {
          type: dialogType,
          adminEous: employeesRes.data,
        },
      });
      expect(modalControllerSpy.present).toHaveBeenCalledTimes(1);
      expect(modalControllerSpy.onDidDismiss).toHaveBeenCalledTimes(1);
      expect(component.contactSupportLoading).toBeFalse();
    }));
  });

  it('openHelpLink', fakeAsync(() => {
    const url = 'https://www.fylehq.com/help';
    const toolbarColor = '#280a31';
    component.openHelpLink();
    tick(500);
    expect(browserHandlerService.openLinkWithToolbarColor).toHaveBeenCalledOnceWith(toolbarColor, url);
  }));
});
