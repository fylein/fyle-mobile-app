import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDetailsCardComponent } from './employee-details-card.component';

describe('EmployeeDetailsCardComponent', () => {
  let component: EmployeeDetailsCardComponent;
  let fixture: ComponentFixture<EmployeeDetailsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeDetailsCardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDetailsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
