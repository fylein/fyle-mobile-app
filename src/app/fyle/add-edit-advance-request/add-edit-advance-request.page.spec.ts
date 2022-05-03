import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddEditAdvanceRequestPage } from './add-edit-advance-request.page';

xdescribe('AddEditAdvanceRequestPage', () => {
  let component: AddEditAdvanceRequestPage;
  let fixture: ComponentFixture<AddEditAdvanceRequestPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AddEditAdvanceRequestPage],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(AddEditAdvanceRequestPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
