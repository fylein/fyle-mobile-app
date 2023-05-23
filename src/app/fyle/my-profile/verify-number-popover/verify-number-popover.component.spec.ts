import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { MobileNumberVerificationService } from 'src/app/core/services/mobile-number-verification.service';
import { VerifyNumberPopoverComponent } from './verify-number-popover.component';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { of } from 'rxjs';
import { FyAlertInfoComponent } from 'src/app/shared/components/fy-alert-info/fy-alert-info.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FormButtonValidationDirective } from 'src/app/shared/directive/form-button-validation.directive';
import { MatIconTestingModule } from '@angular/material/icon/testing';

fdescribe('VerifyNumberPopoverComponent', () => {
  let component: VerifyNumberPopoverComponent;
  let fixture: ComponentFixture<VerifyNumberPopoverComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let mobileNumberVerificationService: jasmine.SpyObj<MobileNumberVerificationService>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const mobileNumberVerificationServiceSpy = jasmine.createSpyObj('MobileNumberVerificationService', [
      'sendOtp',
      'verifyOtp',
    ]);

    TestBed.configureTestingModule({
      declarations: [VerifyNumberPopoverComponent, FyAlertInfoComponent, FormButtonValidationDirective],
      imports: [IonicModule.forRoot(), FormsModule, MatIconModule, MatIconTestingModule],
      providers: [
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: MobileNumberVerificationService, useValue: mobileNumberVerificationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyNumberPopoverComponent);
    component = fixture.componentInstance;

    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    mobileNumberVerificationService = TestBed.inject(
      MobileNumberVerificationService
    ) as jasmine.SpyObj<MobileNumberVerificationService>;

    component.extendedOrgUser = apiEouRes;
    mobileNumberVerificationService.sendOtp.and.returnValue(of({}));
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('validateInput', () => {});

  xit('goBack', () => {});

  xit('onFocus', () => {});

  xit('resendOtp', () => {});

  xit('verifyOtp', () => {});
});
