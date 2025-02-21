import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { DelegatedAccMessageComponent } from './delegated-acc-message.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { EllipsisPipe } from '../../pipes/ellipses.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';

describe('DelegatedAccMessageComponent', () => {
  let component: DelegatedAccMessageComponent;
  let fixture: ComponentFixture<DelegatedAccMessageComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    authServiceSpy.getEou.and.returnValue(of(apiEouRes));
    TestBed.configureTestingModule({
      declarations: [DelegatedAccMessageComponent, EllipsisPipe],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DelegatedAccMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should display delegatee's name", () => {
    component.delegateeName = 'Abhishek Jain';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.delegated-acc').textContent).toContain(
      `You're now managing Abhishek Jain's account`
    );
  });
});
