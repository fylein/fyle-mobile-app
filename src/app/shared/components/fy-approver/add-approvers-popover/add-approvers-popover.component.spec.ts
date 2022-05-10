import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddApproversPopoverComponent } from './add-approvers-popover.component';

xdescribe('AddApproversPopoverComponent', () => {
  let component: AddApproversPopoverComponent;
  let fixture: ComponentFixture<AddApproversPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddApproversPopoverComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddApproversPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
