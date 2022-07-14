import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PolicyViolationActionComponent } from './policy-violation-action.component';

describe('PolicyViolationActionComponent', () => {
  let component: PolicyViolationActionComponent;
  let fixture: ComponentFixture<PolicyViolationActionComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PolicyViolationActionComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(PolicyViolationActionComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
