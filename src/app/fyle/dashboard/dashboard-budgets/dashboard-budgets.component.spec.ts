import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardBudgetsComponent } from './dashboard-budgets.component';

describe('DashboardBudgetsComponent', () => {
  let component: DashboardBudgetsComponent;
  let fixture: ComponentFixture<DashboardBudgetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardBudgetsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardBudgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
