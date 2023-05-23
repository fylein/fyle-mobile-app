import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrgUserService } from 'src/app/core/services/org-user.service';
import { UpdateMobileNumberComponent } from './update-mobile-number.component';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { FormsModule } from '@angular/forms';
import { FormButtonValidationDirective } from 'src/app/shared/directive/form-button-validation.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';

fdescribe('UpdateMobileNumberComponent', () => {
  let component: UpdateMobileNumberComponent;
  let fixture: ComponentFixture<UpdateMobileNumberComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let authService: jasmine.SpyObj<AuthService>;
  let orgUserService: jasmine.SpyObj<OrgUserService>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['refreshEou']);
    const orgUserServiceSpy = jasmine.createSpyObj('OrgUserService', ['postOrgUser']);

    TestBed.configureTestingModule({
      declarations: [UpdateMobileNumberComponent, FormButtonValidationDirective],
      imports: [IonicModule.forRoot(), FormsModule, MatIconModule, MatIconTestingModule],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: OrgUserService,
          useValue: orgUserServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(UpdateMobileNumberComponent);
    component = fixture.componentInstance;

    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    orgUserService = TestBed.inject(OrgUserService) as jasmine.SpyObj<OrgUserService>;

    component.extendedOrgUser = apiEouRes;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('closePopover', () => {});

  xit('validateInput', () => {});

  xit('onFocus', () => {});

  xit('saveValue', () => {});
});
