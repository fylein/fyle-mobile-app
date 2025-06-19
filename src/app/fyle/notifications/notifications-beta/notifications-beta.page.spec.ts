import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationsBetaPage } from './notifications-beta.page';

describe('NotificationsBetaPage', () => {
  let component: NotificationsBetaPage;
  let fixture: ComponentFixture<NotificationsBetaPage>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [NotificationsBetaPage],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: Router,
          useValue: routerSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsBetaPage);
    component = fixture.componentInstance;

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('goBack(): should go back to the profile page', () => {
    component.goBack();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_profile']);
  });
});
