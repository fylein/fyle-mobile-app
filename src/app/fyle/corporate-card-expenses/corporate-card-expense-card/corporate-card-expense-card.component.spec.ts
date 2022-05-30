import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CorporateCardExpenseCardComponent } from './corporate-card-expense-card.component';

xdescribe('CorporateCardExpenseCardComponent', () => {
  let component: CorporateCardExpenseCardComponent;
  let fixture: ComponentFixture<CorporateCardExpenseCardComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CorporateCardExpenseCardComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(CorporateCardExpenseCardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
