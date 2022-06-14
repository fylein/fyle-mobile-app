import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TeamReportsSearchFilterComponent } from './team-reports-search-filter.component';

xdescribe('TeamReportsSearchFilterComponent', () => {
  let component: TeamReportsSearchFilterComponent;
  let fixture: ComponentFixture<TeamReportsSearchFilterComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TeamReportsSearchFilterComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(TeamReportsSearchFilterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
