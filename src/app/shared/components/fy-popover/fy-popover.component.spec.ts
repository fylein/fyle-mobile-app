import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FyPopoverComponent } from './fy-popover.component';

describe('FyPopoverComponent', () => {
  let component: FyPopoverComponent;
  let fixture: ComponentFixture<FyPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FyPopoverComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FyPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
