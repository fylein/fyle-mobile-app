import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewTeamReportEtxnCardComponent } from './view-team-report-etxn-card.component';

xdescribe('ViewTeamReportEtxnCardComponent', () => {
  let component: ViewTeamReportEtxnCardComponent;
  let fixture: ComponentFixture<ViewTeamReportEtxnCardComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ViewTeamReportEtxnCardComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(ViewTeamReportEtxnCardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
