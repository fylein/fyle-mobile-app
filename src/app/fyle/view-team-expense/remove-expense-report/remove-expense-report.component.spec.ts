import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RemoveExpenseReportComponent } from './remove-expense-report.component';

describe('RemoveExpenseReportComponent', () => {
  let component: RemoveExpenseReportComponent;
  let fixture: ComponentFixture<RemoveExpenseReportComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [RemoveExpenseReportComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(RemoveExpenseReportComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
