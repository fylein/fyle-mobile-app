import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyCriticalPolicyViolationComponent } from './fy-critical-policy-violation.component';

describe('FyCriticalPolicyViolationComponent', () => {
  let component: FyCriticalPolicyViolationComponent;
  let fixture: ComponentFixture<FyCriticalPolicyViolationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FyCriticalPolicyViolationComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FyCriticalPolicyViolationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
