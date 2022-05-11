import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { viewTeamAdvanceRequestPage } from './view-team-advance-request.page';

xdescribe('viewTeamAdvanceRequestPage', () => {
  let component: viewTeamAdvanceRequestPage;
  let fixture: ComponentFixture<viewTeamAdvanceRequestPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [viewTeamAdvanceRequestPage],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(viewTeamAdvanceRequestPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
