import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { SendEmailComponent } from 'src/app/shared/components/send-email/send-email.component';
import { ResetPasswordPage } from './reset-password.page';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { Router, RouterModule, Routes } from '@angular/router';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageState } from 'src/app/core/models/page-state.enum';
import { of, throwError } from 'rxjs';

describe('ResetPasswordPage', () => {
  let component: ResetPasswordPage;
  let fixture: ComponentFixture<ResetPasswordPage>;
  let router: jasmine.SpyObj<Router>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let location: jasmine.SpyObj<Location>;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const locationSpy = jasmine.createSpyObj('Location', ['path']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['sendResetPassword']);
    TestBed.configureTestingModule({
      declarations: [ResetPasswordPage],
      imports: [IonicModule.forRoot(), RouterTestingModule, RouterModule, FormsModule, ReactiveFormsModule],
      providers: [
        {
          provide: RouterAuthService,
          useValue: routerAuthServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: Location,
          useValue: locationSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    location = TestBed.inject(Location) as jasmine.SpyObj<Location>;
    routerAuthService = TestBed.inject(RouterAuthService) as jasmine.SpyObj<RouterAuthService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set current page state on component creation', () => {
    component.ionViewWillEnter();
    expect(component.currentPageState).toEqual(PageState.notSent);
  });

  describe('sendResetLink():', () => {
    it('should send reset password link, change loading and page state', () => {
      routerAuthService.sendResetPassword.and.returnValue(of({}));

      const email = 'jay.b@fyle.in';
      component.sendResetLink(email);
      expect(component.isLoading).toEqual(false);
      expect(component.currentPageState).toEqual(PageState.success);
    });

    it('should send reset password link, change loading and page state', () => {
      routerAuthService.sendResetPassword.and.returnValue(throwError(() => new Error('Error message')));
      spyOn(component, 'handleError').and.callThrough();

      const email = 'jay.b@fyle.in';
      component.sendResetLink(email);
      expect(component.isLoading).toEqual(true);
      expect(component.handleError).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleError():', () => {
    it('should navigate to disabled auth', () => {
      component.handleError({
        status: 422,
        message: 'Error message',
      });

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'disabled']);
    });

    it('should change page state if auth not disabled', () => {
      component.handleError({
        status: 400,
        message: 'Error message',
      });

      expect(component.currentPageState).toEqual(PageState.failure);
    });
  });
});
