import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { EmployeeDetailsCardComponent } from './employee-details-card.component';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { InitialsPipe } from 'src/app/shared/pipes/initials.pipe';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { MatTooltipModule } from '@angular/material/tooltip';
import { postOrgUser } from 'src/app/core/test-data/org-user.service.spec.data';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { getTextContent } from 'src/app/core/dom-helpers';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { click } from 'src/app/core/dom-helpers';

describe('EmployeeDetailsCardComponent', () => {
  let component: EmployeeDetailsCardComponent;
  let fixture: ComponentFixture<EmployeeDetailsCardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;
  let cdRef: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['refreshEou']);
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['postOrgUser']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['activated', 'showToastMessage']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesServiceSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);
    const cdRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    TestBed.configureTestingModule({
      declarations: [EmployeeDetailsCardComponent, InitialsPipe],
      imports: [IonicModule.forRoot(), MatTooltipModule],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: OrgUserService,
          useValue: orgUserServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackBarSpy,
        },
        {
          provide: SnackbarPropertiesService,
          useValue: snackbarPropertiesServiceSpy,
        },
        {
          provide: ChangeDetectorRef,
          useValue: cdRefSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EmployeeDetailsCardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    cdRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;

    component.eou = apiEouRes;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updateMobileNumber(): should update user mobile number', async () => {
    component.eou = apiEouRes;
    orgUserService.postOrgUser.and.returnValue(of(postOrgUser));
    authService.refreshEou.and.returnValue(of(apiEouRes));
    matSnackBar.openFromComponent.and.callThrough();
    trackingService.activated.and.callThrough();
    popoverController.create.and.returnValue(
      new Promise((resolve) => {
        const updateMobileNumberPopoverSpy = jasmine.createSpyObj('updateMobileNumberPopover', [
          'present',
          'onWillDismiss',
        ]) as any;

        updateMobileNumberPopoverSpy.onWillDismiss.and.returnValue(
          new Promise((resInt) => {
            resInt({
              data: 'data',
            });
          })
        );

        resolve(updateMobileNumberPopoverSpy);
      })
    );
    fixture.detectChanges();

    await component.updateMobileNumber();

    expect(orgUserService.postOrgUser).toHaveBeenCalledOnceWith(component.eou.ou);
    expect(authService.refreshEou).toHaveBeenCalledTimes(1);
    expect(trackingService.activated).toHaveBeenCalledTimes(1);
    expect(matSnackBar.openFromComponent).toHaveBeenCalledOnceWith(ToastMessageComponent, {
      panelClass: ['msb-success'],
    });
    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledOnceWith('success', {
      message: 'Profile saved successfully',
    });
  });

  it('should display information correctly', () => {
    component.eou.ou.employee_id = 'test_employee';
    fixture.detectChanges();
    expect(getTextContent(getElementBySelector(fixture, '.employee-details-card__icon-container__text'))).toEqual('AJ');
    expect(getTextContent(getElementBySelector(fixture, '.employee-details-card__header'))).toEqual('Abhishek Jain');
    expect(getTextContent(getElementBySelector(fixture, '[data-testid="employee_id"]'))).toEqual('test_employee');
  });

  it('should show update mobile number popup when clicked', () => {
    spyOn(component, 'updateMobileNumber');
    const updateMobileNumberCard = getElementBySelector(fixture, '.employee-details-card__value') as HTMLElement;

    click(updateMobileNumberCard);
    expect(component.updateMobileNumber).toHaveBeenCalledTimes(1);
  });

  it('should show tooltip when clicked on', () => {
    spyOn(component, 'showTooltip');
    const toolTipCard = getElementBySelector(fixture, '[data-testid="employee_id"]') as HTMLElement;
    click(toolTipCard);

    expect(component.showTooltip).toHaveBeenCalledTimes(1);
  });
});
