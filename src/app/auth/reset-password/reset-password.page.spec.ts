import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { SendEmailComponent } from 'src/app/shared/components/send-email/send-email.component';
import { ResetPasswordPage } from './reset-password.page';
import { RouterAuthService } from 'src/app/core/services/router-auth.service';
import { Router, RouterModule, Routes } from '@angular/router';
import { Location } from '@angular/common';
import { appRoutes } from 'src/app/app-routing.module';
import { fyleRoutes } from 'src/app/fyle/fyle-routing.module';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('ResetPasswordPage', () => {
  let component: ResetPasswordPage;
  let fixture: ComponentFixture<ResetPasswordPage>;
  let router: jasmine.SpyObj<Router>;
  let routerAuthService: jasmine.SpyObj<RouterAuthService>;
  let location: jasmine.SpyObj<Location>;

  const routes: Routes = {
    ...appRoutes,
    ...fyleRoutes,
  };

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const locationSpy = jasmine.createSpyObj('Location', ['path']);
    const routerAuthServiceSpy = jasmine.createSpyObj('RouterAuthService', ['sendResetPassword']);
    TestBed.configureTestingModule({
      declarations: [ResetPasswordPage, SendEmailComponent],
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

  describe('handleError():', () => {
    it('should navigate to disabled auth', () => {
      component.handleError({
        status: 422,
        message: 'Error message',
      });

      expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'disabled']);
    });
  });
});
