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
    modalController = jasmine.createSpyObj('ModalController', ['create']);
    orgUserService = jasmine.createSpyObj('OrgUserService', ['getEmployeesByParams']);
    loaderService = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    trackingService = jasmine.createSpyObj('TrackingService', ['viewHelpCard']);
    authService = jasmine.createSpyObj('AuthService', ['getEou']);
    browserHandlerService = jasmine.createSpyObj('BrowserHandlerService', ['openLinkWithToolbarColor']);

    TestBed.configureTestingModule({
      declarations: [HelpPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalController },
        { provide: OrgUserService, useValue: orgUserService },
        { provide: LoaderService, useValue: loaderService },
        { provide: TrackingService, useValue: trackingService },
        { provide: AuthService, useValue: authService },
        { provide: BrowserHandlerService, useValue: browserHandlerService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpPage);
    component = fixture.componentInstance;
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
    expect(loaderService.showLoader).toHaveBeenCalledWith('Please wait', 10000);
    expect(authService.getEou).toHaveBeenCalled();
    expect(orgUserService.getEmployeesByParams).toHaveBeenCalledWith(params);
    expect(loaderService.hideLoader).toHaveBeenCalled();
    expect(component.orgAdmins).toEqual(employeesRes.data);
    expect(component.presentSupportModal).toHaveBeenCalledWith(dialogType);
  }));

  describe('presentSupportModal():', () => {
    it('should open present support modal when the dialog type is contact_support and when data is present', fakeAsync(() => {
      const dialogType = 'contact_support';
      component.orgAdmins = employeesRes.data;
      const modalControllerSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
      modalController.create.and.returnValue(modalControllerSpy);
      modalControllerSpy.onDidDismiss.and.resolveTo({ data: { dismissed: true } } as any);
      component.presentSupportModal(dialogType);
      tick(500);
      expect(trackingService.viewHelpCard).toHaveBeenCalled();
      expect(modalController.create).toHaveBeenCalledWith({
        component: SupportDialogPage,
        componentProps: {
          type: dialogType,
          adminEous: employeesRes,
        },
      });
      expect(modalControllerSpy.present).toHaveBeenCalled();
      expect(modalControllerSpy.onDidDismiss).toHaveBeenCalled();
      expect(component.contactSupportLoading).toBeFalse();
    }));

    it('should open present support modal when the dialog type is not contact_support and when no data is present', fakeAsync(() => {
      const dialogType = 'capture_email';
      component.orgAdmins = employeesRes.data;
      const modalControllerSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
      modalController.create.and.returnValue(modalControllerSpy);
      modalControllerSpy.onDidDismiss.and.resolveTo({ data: null });
      component.presentSupportModal(dialogType);
      tick(500);
      expect(trackingService.viewHelpCard).toHaveBeenCalled();
      expect(modalController.create).toHaveBeenCalledWith({
        component: SupportDialogPage,
        componentProps: {
          type: dialogType,
          adminEous: employeesRes,
        },
      });
      expect(modalControllerSpy.present).toHaveBeenCalled();
      expect(modalControllerSpy.onDidDismiss).toHaveBeenCalled();
      expect(component.contactSupportLoading).toBeFalse();
    }));
  });

  it('openHelpLink', fakeAsync(() => {
    const url = 'https://help.fylehq.com';
    const toolbarColor = '#280a31';
    component.openHelpLink();
    tick(500);
    expect(browserHandlerService.openLinkWithToolbarColor).toHaveBeenCalledWith(toolbarColor, url);
  }));
});
