import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TeamReportsSearchFilterComponent } from './team-reports-search-filter.component';

describe('TeamReportsSearchFilterComponent', () => {
  let component: TeamReportsSearchFilterComponent;
  let fixture: ComponentFixture<TeamReportsSearchFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamReportsSearchFilterComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamReportsSearchFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
