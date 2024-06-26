import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { EmployeeDetailsCardComponent } from './employee-details-card.component';
import { InitialsPipe } from 'src/app/shared/pipes/initials.pipe';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { getTextContent } from 'src/app/core/dom-helpers';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { cloneDeep } from 'lodash';
import { UtilityService } from 'src/app/core/services/utility.service';

describe('EmployeeDetailsCardComponent', () => {
  let component: EmployeeDetailsCardComponent;
  let fixture: ComponentFixture<EmployeeDetailsCardComponent>;
  let utilityService: jasmine.SpyObj<UtilityService>;

  beforeEach(waitForAsync(() => {
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['isUserFromINCluster']);

    TestBed.configureTestingModule({
      declarations: [EmployeeDetailsCardComponent, InitialsPipe],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: UtilityService,
          useValue: utilityServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EmployeeDetailsCardComponent);
    component = fixture.componentInstance;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    utilityService.isUserFromINCluster.and.resolveTo(false);

    const mockApiEouRes = cloneDeep(apiEouRes);
    component.eou = mockApiEouRes;
    component.isMobileNumberSectionVisible = true;
    fixture.detectChanges();
  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display information correctly', () => {
    component.eou.ou.employee_id = '12345';
    fixture.detectChanges();
    expect(getTextContent(getElementBySelector(fixture, '.employee-details-card__icon-container__text'))).toEqual('AJ');
    expect(getTextContent(getElementBySelector(fixture, '.employee-details-card__header'))).toEqual('Abhishek Jain');
    expect(getTextContent(getElementBySelector(fixture, '.employee-details-card__employee-id'))).toEqual(
      'Employee ID - 12345'
    );
  });

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
