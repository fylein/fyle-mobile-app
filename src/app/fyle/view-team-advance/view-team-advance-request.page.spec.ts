import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewTeamAdvancePage } from './view-team-advance-request.page';

xdescribe('ViewTeamAdvancePage', () => {
  let component: ViewTeamAdvancePage;
  let fixture: ComponentFixture<ViewTeamAdvancePage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ViewTeamAdvancePage],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(ViewTeamAdvancePage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
