import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FyInputPopoverComponent } from './fy-input-popover.component';

describe('FyInputPopoverComponent', () => {
  let component: FyInputPopoverComponent;
  let fixture: ComponentFixture<FyInputPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FyInputPopoverComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FyInputPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
