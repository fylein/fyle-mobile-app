import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewTeamAdvancePage } from './view-team-advance.page';

describe('ViewTeamAdvancePage', () => {
  let component: ViewTeamAdvancePage;
  let fixture: ComponentFixture<ViewTeamAdvancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTeamAdvancePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTeamAdvancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
