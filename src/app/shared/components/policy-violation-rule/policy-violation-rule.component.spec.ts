import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PolicyViolationRuleComponent } from './policy-violation-rule.component';

describe('PolicyViolationRuleComponent', () => {
  let component: PolicyViolationRuleComponent;
  let fixture: ComponentFixture<PolicyViolationRuleComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PolicyViolationRuleComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(PolicyViolationRuleComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
