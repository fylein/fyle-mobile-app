import { ComponentFixture, TestBed, async, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { DelegatedAccMessageComponent } from './delegated-acc-message.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { EllipsisPipe } from '../../pipes/ellipses.pipe';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('DelegatedAccMessageComponent', () => {
  let component: DelegatedAccMessageComponent;
  let fixture: ComponentFixture<DelegatedAccMessageComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [DelegatedAccMessageComponent, EllipsisPipe],
      imports: [IonicModule.forRoot(), TranslocoModule],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DelegatedAccMessageComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    authService.getEou.and.resolveTo(apiEouRes);
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'delegatedAccMessage.managingAccount': "You're now managing {{delegateeName}}'s account",
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should display delegatee's name", fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(getTextContent(getElementBySelector(fixture, '.delegated-acc'))).toEqual(
      `You're now managing Abhishek Jain's account`
    );
  }));
});
