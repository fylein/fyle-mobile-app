import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewTeamMileagePage } from './view-team-mileage.page';

describe('ViewTeamMileagePage', () => {
  let component: ViewTeamMileagePage;
  let fixture: ComponentFixture<ViewTeamMileagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTeamMileagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTeamMileagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
