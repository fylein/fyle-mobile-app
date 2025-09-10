import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PolicyViolationRuleComponent } from './policy-violation-rule.component';

describe('PolicyViolationRuleComponent', () => {
  let component: PolicyViolationRuleComponent;
  let fixture: ComponentFixture<PolicyViolationRuleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ PolicyViolationRuleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyViolationRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
