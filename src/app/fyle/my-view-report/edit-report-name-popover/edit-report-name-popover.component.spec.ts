import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReportNamePopoverComponent } from './edit-report-name-popover.component';

describe('EditReportNamePopoverComponent', () => {
  let component: EditReportNamePopoverComponent;
  let fixture: ComponentFixture<EditReportNamePopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditReportNamePopoverComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditReportNamePopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
