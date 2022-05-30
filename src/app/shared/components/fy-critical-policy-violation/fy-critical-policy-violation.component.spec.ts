import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyCriticalPolicyViolationComponent } from './fy-critical-policy-violation.component';

xdescribe('FyCriticalPolicyViolationComponent', () => {
  let component: FyCriticalPolicyViolationComponent;
  let fixture: ComponentFixture<FyCriticalPolicyViolationComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FyCriticalPolicyViolationComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(FyCriticalPolicyViolationComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
