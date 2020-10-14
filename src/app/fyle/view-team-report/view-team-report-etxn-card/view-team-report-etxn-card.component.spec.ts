import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewTeamReportEtxnCardComponent } from './view-team-report-etxn-card.component';

describe('ViewTeamReportEtxnCardComponent', () => {
  let component: ViewTeamReportEtxnCardComponent;
  let fixture: ComponentFixture<ViewTeamReportEtxnCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTeamReportEtxnCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTeamReportEtxnCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
