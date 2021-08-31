import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FyFlagExpenseComponent } from './fy-flag-expense.component';

describe('FyFlagExpenseComponent', () => {
  let component: FyFlagExpenseComponent;
  let fixture: ComponentFixture<FyFlagExpenseComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FyFlagExpenseComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(FyFlagExpenseComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
