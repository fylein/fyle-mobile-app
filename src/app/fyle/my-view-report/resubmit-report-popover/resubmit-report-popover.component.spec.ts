import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ResubmitReportPopoverComponent } from './resubmit-report-popover.component';

xdescribe('ResubmitReportPopoverComponent', () => {
  let component: ResubmitReportPopoverComponent;
  let fixture: ComponentFixture<ResubmitReportPopoverComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ResubmitReportPopoverComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(ResubmitReportPopoverComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
