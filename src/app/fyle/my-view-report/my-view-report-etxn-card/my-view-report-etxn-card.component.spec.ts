import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyViewReportEtxnCardComponent } from './my-view-report-etxn-card.component';

xdescribe('MyViewReportEtxnCardComponent', () => {
  let component: MyViewReportEtxnCardComponent;
  let fixture: ComponentFixture<MyViewReportEtxnCardComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MyViewReportEtxnCardComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(MyViewReportEtxnCardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
