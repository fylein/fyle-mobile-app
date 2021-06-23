import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExpensesAddedToReportToastMessageComponent } from './expenses-added-to-report-toast-message.component';

describe('ExpensesAddedToReportToastMessageComponent', () => {
  let component: ExpensesAddedToReportToastMessageComponent;
  let fixture: ComponentFixture<ExpensesAddedToReportToastMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpensesAddedToReportToastMessageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesAddedToReportToastMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
