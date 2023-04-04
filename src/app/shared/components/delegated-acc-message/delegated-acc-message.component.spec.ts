import { ComponentFixture, TestBed, async, fakeAsync, flush, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { DelegatedAccMessageComponent } from './delegated-acc-message.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { EllipsisPipe } from '../../pipes/ellipses.pipe';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('DelegatedAccMessageComponent', () => {
  let component: DelegatedAccMessageComponent;
  let fixture: ComponentFixture<DelegatedAccMessageComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    TestBed.configureTestingModule({
      declarations: [DelegatedAccMessageComponent, EllipsisPipe],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DelegatedAccMessageComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authService.getEou.and.returnValue(Promise.resolve(apiEouRes));
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should display delegatee's name", () => {
    expect(getTextContent(getElementBySelector(fixture, '.delegated-acc'))).toEqual(`You're now managing 's account`);
  });
});
