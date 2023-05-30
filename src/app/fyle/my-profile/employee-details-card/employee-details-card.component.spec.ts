import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { EmployeeDetailsCardComponent } from './employee-details-card.component';
import { InitialsPipe } from 'src/app/shared/pipes/initials.pipe';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { getTextContent } from 'src/app/core/dom-helpers';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { click } from 'src/app/core/dom-helpers';

describe('EmployeeDetailsCardComponent', () => {
  let component: EmployeeDetailsCardComponent;
  let fixture: ComponentFixture<EmployeeDetailsCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeDetailsCardComponent, InitialsPipe],
      imports: [IonicModule.forRoot()],
      providers: [],
    }).compileComponents();
    fixture = TestBed.createComponent(EmployeeDetailsCardComponent);
    component = fixture.componentInstance;

    component.eou = apiEouRes;
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

  it('should emit updateMobileNumber event when add button is clicked', () => {
    spyOn(component, 'onUpdateMobileNumber').and.callThrough();
    spyOn(component.updateMobileNumber, 'emit');

    const updateMobileNumberCard = getElementBySelector(
      fixture,
      '.employee-details-card__bottom-section__number-container'
    ) as HTMLElement;

    click(updateMobileNumberCard);
    fixture.detectChanges();
    expect(component.onUpdateMobileNumber).toHaveBeenCalledOnceWith(apiEouRes);
    expect(component.updateMobileNumber.emit).toHaveBeenCalledOnceWith(apiEouRes);
  });
});
