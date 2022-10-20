import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewTeamAdvanceRequestPage } from './view-team-advance-request.page';

xdescribe('ViewTeamAdvanceRequestPage', () => {
  let component: ViewTeamAdvanceRequestPage;
  let fixture: ComponentFixture<ViewTeamAdvanceRequestPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ViewTeamAdvanceRequestPage],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(ViewTeamAdvanceRequestPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
