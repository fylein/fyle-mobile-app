import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewTeamExpensePage } from './view-team-expense.page';

describe('ViewTeamExpensePage', () => {
  let component: ViewTeamExpensePage;
  let fixture: ComponentFixture<ViewTeamExpensePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTeamExpensePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTeamExpensePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
