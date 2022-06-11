import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyCriticalPolicyViolationMessageComponent } from './fy-critical-policy-violation-message.component';

describe('FyCriticalPolicyViolationMessageComponent', () => {
  let component: FyCriticalPolicyViolationMessageComponent;
  let fixture: ComponentFixture<FyCriticalPolicyViolationMessageComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FyCriticalPolicyViolationMessageComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(FyCriticalPolicyViolationMessageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
