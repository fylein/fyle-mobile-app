import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FyViewReportInfoComponent } from './fy-view-report-info.component';

xdescribe('FyViewReportInfoComponent', () => {
  let component: FyViewReportInfoComponent;
  let fixture: ComponentFixture<FyViewReportInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FyViewReportInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FyViewReportInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
