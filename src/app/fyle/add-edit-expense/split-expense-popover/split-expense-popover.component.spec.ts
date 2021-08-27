import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SplitExpensePopoverComponent } from './split-expense-popover.component';

describe('SplitExpensePopoverComponent', () => {
  let component: SplitExpensePopoverComponent;
  let fixture: ComponentFixture<SplitExpensePopoverComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SplitExpensePopoverComponent],
        imports: [IonicModule.forRoot()]
      }).compileComponents();

      fixture = TestBed.createComponent(SplitExpensePopoverComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
