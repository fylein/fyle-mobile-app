import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProfileOptInCardComponent } from './profile-opt-in-card.component';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { eouRes2 } from 'src/app/core/mock-data/extended-org-user.data';
import { cloneDeep } from 'lodash';

describe('ProfileOptInCardComponent', () => {
  let component: ProfileOptInCardComponent;
  let fixture: ComponentFixture<ProfileOptInCardComponent>;
  let clipboardService: jasmine.SpyObj<ClipboardService>;
  let trackingService: jasmine.SpyObj<TrackingService>;

  beforeEach(waitForAsync(() => {
    const clipboardServiceSpy = jasmine.createSpyObj('ClipboardService', ['writeString']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', [
      'clickedOptInFromProfile',
      'clickedOnOptOut',
      'clickedOnEditNumber',
      'clickedOnDeleteNumber',
    ]);

    TestBed.configureTestingModule({
      declarations: [ProfileOptInCardComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ClipboardService, useValue: clipboardServiceSpy },
        { provide: TrackingService, useValue: trackingServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileOptInCardComponent);
    component = fixture.componentInstance;
    clipboardService = TestBed.inject(ClipboardService) as jasmine.SpyObj<ClipboardService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit(): ', () => {
    it('should set isUserOptedIn to true if mobile number is present and verified', () => {
      const mockEou = cloneDeep(eouRes2);
      mockEou.ou.mobile = '1234567890';
      mockEou.ou.mobile_verified = true;
      component.extendedOrgUser = mockEou;
      component.ngOnInit();
      expect(component.isUserOptedIn).toBeTrue();
    });

    it('should set isUserOptedIn to false if mobile number is present and not verified', () => {
      const mockEou = cloneDeep(eouRes2);
      mockEou.ou.mobile = '1234567890';
      mockEou.ou.mobile_verified = false;
      component.extendedOrgUser = mockEou;
      component.ngOnInit();
      expect(component.isUserOptedIn).toBeFalse();
    });

    it('should set mobile number', () => {
      const mockEou = cloneDeep(eouRes2);
      mockEou.ou.mobile = '1234567890';
      component.extendedOrgUser = mockEou;
      component.ngOnInit();
      expect(component.mobileNumber).toEqual('1234567890');
    });
  });

  describe('clickedOnOptIn():', () => {
    it('should track event and emit optInClicked', () => {
      spyOn(component.optInClicked, 'emit');
      component.clickedOnOptIn();
      expect(trackingService.clickedOptInFromProfile).toHaveBeenCalledTimes(1);
      expect(component.optInClicked.emit).toHaveBeenCalledOnceWith(component.extendedOrgUser);
    });

    it('should not emit optInClicked if user is already opted in', () => {
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
    expect(component.deleteMobileNumberClicked.emit).toHaveBeenCalledOnceWith(component.extendedOrgUser);
  });
});
