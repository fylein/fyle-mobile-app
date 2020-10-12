import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TeamAdvancePage } from './team-advance.page';

describe('TeamAdvancePage', () => {
  let component: TeamAdvancePage;
  let fixture: ComponentFixture<TeamAdvancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamAdvancePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamAdvancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
