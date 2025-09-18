import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UserEventService } from 'src/app/core/services/user-event.service';

import { DisabledPage } from './disabled.page';

describe('DisabledPage', () => {
  let component: DisabledPage;
  let fixture: ComponentFixture<DisabledPage>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [ DisabledPage],
      providers: [
        { provide: UserEventService, useValue: userEventServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DisabledPage);
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should logout and navigate to /auth/sign_in when onGotoSignInClick is called', () => {
    component.onGotoSignInClick();
    expect(userEventService.logout).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'auth', 'sign_in']);
  });
});
