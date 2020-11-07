import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewTeamPerDiemPage } from './view-team-per-diem.page';

describe('ViewTeamPerDiemPage', () => {
  let component: ViewTeamPerDiemPage;
  let fixture: ComponentFixture<ViewTeamPerDiemPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTeamPerDiemPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTeamPerDiemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
