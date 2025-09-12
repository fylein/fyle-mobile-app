import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule } from '@ionic/angular';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';

import { ProfileOptInCardComponent } from './profile-opt-in-card.component';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { EmployeesService } from 'src/app/core/services/platform/v1/spender/employees.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { eouRes2 } from 'src/app/core/mock-data/extended-org-user.data';
import { platformEmployeeResponse } from 'src/app/core/mock-data/platform/v1/platform-employee.data';
import { platformEmployeeData } from 'src/app/core/mock-data/platform/v1/platform-employee.data';
import { ExtendedOrgUser } from 'src/app/core/models/extended-org-user.model';
import { PlatformEmployee } from 'src/app/core/models/platform/platform-employee.model';
import { PlatformApiResponse } from 'src/app/core/models/platform/platform-api-response.model';

describe('ProfileOptInCardComponent', () => {
  let component: ProfileOptInCardComponent;
  let fixture: ComponentFixture<ProfileOptInCardComponent>;
  let clipboardService: jasmine.SpyObj<ClipboardService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let employeesService: jasmine.SpyObj<EmployeesService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const clipboardServiceSpy = jasmine.createSpyObj('ClipboardService', ['writeString']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'clickedOptInFromProfile',
      'clickedOnOptOut',
      'clickedOnEditNumber',
      'clickedOnDeleteNumber',
    ]);
    const employeesServiceSpy = jasmine.createSpyObj('EmployeesService', ['getByParams']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [ProfileOptInCardComponent],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, TranslocoModule],
      providers: [
        { provide: ClipboardService, useValue: clipboardServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
        { provide: EmployeesService, useValue: employeesServiceSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileOptInCardComponent);
    component = fixture.componentInstance;
    clipboardService = TestBed.inject(ClipboardService) as jasmine.SpyObj<ClipboardService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    employeesService = TestBed.inject(EmployeesService) as jasmine.SpyObj<EmployeesService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'profileOptInCard.copySuccess': 'Phone Number Copied Successfully',
        'profileOptInCard.title': 'Opt-in to text receipts',
        'profileOptInCard.description': 'Opt-in to activate text messages for instant expense submission.',
        'profileOptInCard.optIn': 'Opt-in',
        'profileOptInCard.status': 'Status',
        'profileOptInCard.optOut': 'Opt-out',
        'profileOptInCard.optedIn': 'Opted-in',
        'profileOptInCard.mobileNumber': 'Mobile number',
        'profileOptInCard.usageDescription': 'You can now text your receipts to Fyle at 302-440-2921',
        'profileOptInCard.notOptedIn': 'Not opted-in',
        'profileOptInCard.nonUSNumberInfo':
          'Add a +1 country code to your mobile number to receive text message receipts.',
        'profileOptInCard.updateAndOptIn': 'Update and opt-in',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((key) => {
          translation = translation.replace(`{{${key}}}`, params[key]);
        });
      }
      return translation;
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit(): ', () => {
    let mockExtendedOrgUser: ExtendedOrgUser;
    let mockEmployee: PlatformEmployee;
    let mockResponse: PlatformApiResponse<PlatformEmployee[]>;

    beforeEach(() => {
      mockExtendedOrgUser = cloneDeep(eouRes2);
      mockEmployee = cloneDeep(platformEmployeeData);
      mockResponse = cloneDeep(platformEmployeeResponse);

      component.extendedOrgUser = mockExtendedOrgUser;
    });

    it('should set isUserOptedIn to true if mobile number is present and verified', () => {
      mockEmployee.is_mobile_verified = true;
      mockResponse.data = [mockEmployee];

      employeesService.getByParams.and.returnValue(of(mockResponse));

      component.ngOnInit();
      expect(component.isUserOptedIn).toBeTrue();
    });

    it('should set isUserOptedIn to false if mobile number is present and not verified', () => {
      mockEmployee.is_mobile_verified = false;
      mockResponse.data = [mockEmployee];

      employeesService.getByParams.and.returnValue(of(mockResponse));

      component.ngOnInit();
      expect(component.isUserOptedIn).toBeFalse();
    });

    it('should set mobile number', () => {
      mockResponse.data = [mockEmployee];

      employeesService.getByParams.and.returnValue(of(mockResponse));

      component.ngOnInit();
      expect(component.mobileNumber).toEqual(mockEmployee.mobile);
    });

    it('should set isOptedOutViaSms to true when sms_opt_out_source is SMS', () => {
      mockEmployee.sms_opt_out_source = 'SMS';
      mockResponse.data = [mockEmployee];

      employeesService.getByParams.and.returnValue(of(mockResponse));

      component.ngOnInit();
      expect(component.isOptedOutViaSms).toBeTrue();
    });

    it('should set isInvalidUSNumber to true for non-US numbers when mobile is not verified', () => {
      mockEmployee.mobile = '+91234567890'; // Non-US number
      mockEmployee.is_mobile_verified = false;
      mockResponse.data = [mockEmployee];

      employeesService.getByParams.and.returnValue(of(mockResponse));

      component.ngOnInit();

      expect(component.isInvalidUSNumber).toBeTrue();
      expect(component.isMobileAddedButNotVerified).toBeTrue();
    });
  });

  describe('clickedOnOptIn():', () => {
    it('should track event and emit optInClicked', () => {
      spyOn(component.optInClicked, 'emit');
      component.clickedOnOptIn();
      expect(trackingService.clickedOptInFromProfile).toHaveBeenCalledTimes(1);
      expect(component.optInClicked.emit).toHaveBeenCalledOnceWith(component.extendedOrgUser);
    });

    it('should not emit optInClicked if user is already opted-in', () => {
      spyOn(component.optInClicked, 'emit');
      component.isUserOptedIn = true;
      component.clickedOnOptIn();
      expect(trackingService.clickedOptInFromProfile).not.toHaveBeenCalled();
      expect(component.optInClicked.emit).not.toHaveBeenCalled();
    });
  });

  it('clickedOnOptOut(): should track event and emit optOutClicked', () => {
    spyOn(component.optOutClicked, 'emit');
    component.clickedOnOptOut();
    expect(trackingService.clickedOnOptOut).toHaveBeenCalledTimes(1);
    expect(component.optOutClicked.emit).toHaveBeenCalledTimes(1);
  });

  it('editMobileNumber(): should track event and emit editMobileNumberClicked', () => {
    spyOn(component.editMobileNumberClicked, 'emit');
    component.editMobileNumber();
    expect(trackingService.clickedOnEditNumber).toHaveBeenCalledTimes(1);
    expect(component.editMobileNumberClicked.emit).toHaveBeenCalledOnceWith(component.extendedOrgUser);
  });

  it('copyToClipboard(): should call clipboardService and emit copiedText', async () => {
    spyOn(component.copiedText, 'emit');
    await component.copyToClipboard();
    expect(clipboardService.writeString).toHaveBeenCalledOnceWith('(302) 440-2921');
    expect(component.copiedText.emit).toHaveBeenCalledOnceWith('Phone Number Copied Successfully');
  });

  it('deleteMobileNumber(): should track event and emit deleteMobileNumberClicked', () => {
    spyOn(component.deleteMobileNumberClicked, 'emit');
    component.deleteMobileNumber();
    expect(trackingService.clickedOnDeleteNumber).toHaveBeenCalledTimes(1);
    expect(component.deleteMobileNumberClicked.emit).toHaveBeenCalledTimes(1);
  });
});
