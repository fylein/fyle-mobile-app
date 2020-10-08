import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TeamTripsPage } from './team-trips.page';

describe('TeamTripsPage', () => {
  let component: TeamTripsPage;
  let fixture: ComponentFixture<TeamTripsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamTripsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamTripsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
