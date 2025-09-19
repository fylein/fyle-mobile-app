import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PolicyViolationRuleComponent } from './policy-violation-rule.component';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('PolicyViolationRuleComponent', () => {
  let component: PolicyViolationRuleComponent;
  let fixture: ComponentFixture<PolicyViolationRuleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PolicyViolationRuleComponent,
        MatIconTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyViolationRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
