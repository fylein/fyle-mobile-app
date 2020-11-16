import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddExpensesToReportComponent } from './add-expenses-to-report.component';

describe('AddExpensesToReportComponent', () => {
  let component: AddExpensesToReportComponent;
  let fixture: ComponentFixture<AddExpensesToReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddExpensesToReportComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddExpensesToReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
