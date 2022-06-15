import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyViewAdvanceRequestPage } from './my-view-advance-request.page';

xdescribe('MyViewAdvanceRequestPage', () => {
  let component: MyViewAdvanceRequestPage;
  let fixture: ComponentFixture<MyViewAdvanceRequestPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MyViewAdvanceRequestPage],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(MyViewAdvanceRequestPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
