import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MatchExpensePopoverComponent } from './match-expense-popover.component';

xdescribe('MatchExpensePopoverComponent', () => {
  let component: MatchExpensePopoverComponent;
  let fixture: ComponentFixture<MatchExpensePopoverComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MatchExpensePopoverComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(MatchExpensePopoverComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
