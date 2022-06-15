import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TeamReportsSortFilterComponent } from './team-reports-sort-filter.component';

xdescribe('TeamReportsSortFilterComponent', () => {
  let component: TeamReportsSortFilterComponent;
  let fixture: ComponentFixture<TeamReportsSortFilterComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TeamReportsSortFilterComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(TeamReportsSortFilterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
