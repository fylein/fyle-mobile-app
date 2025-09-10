import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { MobileNumberCardComponent } from './mobile-number-card.component';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';

describe('MobileNumberCardComponent', () => {
  let component: MobileNumberCardComponent;
  let fixture: ComponentFixture<MobileNumberCardComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TranslocoModule, MobileNumberCardComponent],
      providers: [
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileNumberCardComponent);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'mobileNumberCard.title': 'Mobile Number Card',
        'mobileNumberCard.description': 'Mobile Number Card Description',
        'mobileNumberCard.addButton': 'Add Mobile Number',
        'mobileNumberCard.mobileNumberLabel': 'Mobile Number',
      };
      let translation = translations[key] || key;
      if (params) {
        Object.keys(params).forEach((paramKey) => {
          translation = translation.replace(`{{${paramKey}}}`, params[paramKey]);
        });
      }
      return translation;
    });
  }));

  it('should create', () => {
    component.extendedOrgUser = apiEouRes;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should set mobileNumber if mobile number is present in DB', () => {
    const mockEou = cloneDeep(apiEouRes);
    mockEou.ou.mobile = '+11234567890';
    component.extendedOrgUser = mockEou;
    fixture.detectChanges();
    expect(component.mobileNumber).toEqual('+11234567890');
  });

  it('clickedOnAdd(): should emit addMobileNumberClicked event', () => {
    spyOn(component.addMobileNumberClicked, 'emit');
    component.extendedOrgUser = apiEouRes;
    fixture.detectChanges();
    component.clickedOnAdd();
    expect(component.addMobileNumberClicked.emit).toHaveBeenCalledOnceWith(apiEouRes);
  });

  it('editMobileNumber(): should emit editMobileNumberClicked event', () => {
    spyOn(component.editMobileNumberClicked, 'emit');
    component.extendedOrgUser = apiEouRes;
    fixture.detectChanges();
    component.editMobileNumber();
    expect(component.editMobileNumberClicked.emit).toHaveBeenCalledOnceWith(apiEouRes);
  });

  it('deleteMobileNumber(): should emit deleteMobileNumberClicked event', () => {
    spyOn(component.deleteMobileNumberClicked, 'emit');
    component.extendedOrgUser = apiEouRes;
    fixture.detectChanges();
    component.deleteMobileNumber();
    expect(component.deleteMobileNumberClicked.emit).toHaveBeenCalledTimes(1);
  });
});
