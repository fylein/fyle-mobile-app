import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { EmployeeDetailsCardComponent } from './employee-details-card.component';
import { InitialsPipe } from 'src/app/shared/pipes/initials.pipe';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { getTextContent } from 'src/app/core/dom-helpers';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { cloneDeep } from 'lodash';
import { UtilityService } from 'src/app/core/services/utility.service';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('EmployeeDetailsCardComponent', () => {
  let component: EmployeeDetailsCardComponent;
  let fixture: ComponentFixture<EmployeeDetailsCardComponent>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['isUserFromINCluster']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TranslocoModule, EmployeeDetailsCardComponent, InitialsPipe],
      providers: [
        {
          provide: UtilityService,
          useValue: utilityServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EmployeeDetailsCardComponent);
    component = fixture.componentInstance;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    utilityService.isUserFromINCluster.and.resolveTo(false);
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'employeeDetailsCard.employeeId': 'Employee ID -',
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
    const mockApiEouRes = cloneDeep(apiEouRes);
    component.eou = mockApiEouRes;
    component.isMobileNumberSectionVisible = true;
    fixture.detectChanges();
  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display information correctly', fakeAsync(() => {
    component.eou.ou.employee_id = '12345';
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(getTextContent(getElementBySelector(fixture, '.employee-details-card__icon-container__text'))).toEqual('AJ');
    expect(getTextContent(getElementBySelector(fixture, '.employee-details-card__header'))).toEqual('Abhishek Jain');
    expect(getTextContent(getElementBySelector(fixture, '.employee-details-card__employee-id'))).toEqual(
      'Employee ID - 12345'
    );
  }));

  describe('ngOnInit()', () => {
    it('should set isMobileNumberSectionVisible to false if user is from IN cluster', async () => {
      utilityService.isUserFromINCluster.and.resolveTo(true);
      component.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.isMobileNumberSectionVisible).toBeFalse();
    });

    it('should set isMobileNumberSectionVisible to true if user is from IN cluster', async () => {
      utilityService.isUserFromINCluster.and.resolveTo(false);
      component.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component.isMobileNumberSectionVisible).toBeTrue();
    });
  });
});
