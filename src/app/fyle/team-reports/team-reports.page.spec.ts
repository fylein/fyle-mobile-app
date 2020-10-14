import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TeamReportsPage } from './team-reports.page';

describe('TeamReportsPage', () => {
  let component: TeamReportsPage;
  let fixture: ComponentFixture<TeamReportsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamReportsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
