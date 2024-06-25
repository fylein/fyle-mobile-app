import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MobileNumberCardComponent } from './mobile-number-card.component';
import { apiEouRes } from 'src/app/core/mock-data/extended-org-user.data';

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
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clickedOnAdd(): should emit addMobileNumberClicked event', () => {
    spyOn(component.addMobileNumberClicked, 'emit');
    component.extendedOrgUser = apiEouRes;
    component.clickedOnAdd();
    expect(component.addMobileNumberClicked.emit).toHaveBeenCalledOnceWith(apiEouRes);
  });

  it('editMobileNumber(): should emit editMobileNumberClicked event', () => {
    spyOn(component.editMobileNumberClicked, 'emit');
    component.editMobileNumber();
    expect(component.editMobileNumberClicked.emit).toHaveBeenCalled();
  });
});
