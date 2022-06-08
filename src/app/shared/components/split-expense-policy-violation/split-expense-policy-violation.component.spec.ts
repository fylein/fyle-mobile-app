import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SplitExpensePolicyViolationComponent } from './split-expense-policy-violation.component';

describe('SplitExpensePolicyViolationComponent', () => {
  let component: SplitExpensePolicyViolationComponent;
  let fixture: ComponentFixture<SplitExpensePolicyViolationComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SplitExpensePolicyViolationComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(SplitExpensePolicyViolationComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
