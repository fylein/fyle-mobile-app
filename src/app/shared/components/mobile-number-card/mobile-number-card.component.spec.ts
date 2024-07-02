import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MobileNumberCardComponent } from './mobile-number-card.component';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';
import { cloneDeep } from 'lodash';

describe('MobileNumberCardComponent', () => {
  let component: MobileNumberCardComponent;
  let fixture: ComponentFixture<MobileNumberCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MobileNumberCardComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileNumberCardComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit(): should set mobileNumber if mobile number is present in DB', () => {
    const mockEou = cloneDeep(apiEouRes);
    mockEou.ou.mobile = '+11234567890';
    component.extendedOrgUser = mockEou;
    component.ngOnInit();
    expect(component.mobileNumber).toEqual('+11234567890');
  });

  it('clickedOnAdd(): should emit addMobileNumberClicked event', () => {
    spyOn(component.addMobileNumberClicked, 'emit');
    component.extendedOrgUser = apiEouRes;
    component.clickedOnAdd();
    expect(component.addMobileNumberClicked.emit).toHaveBeenCalledOnceWith(apiEouRes);
  });

  it('editMobileNumber(): should emit editMobileNumberClicked event', () => {
    spyOn(component.editMobileNumberClicked, 'emit');
    component.extendedOrgUser = apiEouRes;
    component.editMobileNumber();
    expect(component.editMobileNumberClicked.emit).toHaveBeenCalledOnceWith(apiEouRes);
  });

  it('deleteMobileNumber(): should emit deleteMobileNumberClicked event', () => {
    spyOn(component.deleteMobileNumberClicked, 'emit');
    component.deleteMobileNumber();
    expect(component.deleteMobileNumberClicked.emit).toHaveBeenCalledTimes(1);
  });
});
