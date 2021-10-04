import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SplitExpenseStatusComponent } from './split-expense-status.component';

describe('SplitExpenseStatusComponent', () => {
  let component: SplitExpenseStatusComponent;
  let fixture: ComponentFixture<SplitExpenseStatusComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SplitExpenseStatusComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(SplitExpenseStatusComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
