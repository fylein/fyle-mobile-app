import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { getDummyExpenses } from 'server/test';

import { MyExpensesCardComponent } from './my-expenses-card.component';

describe('MyExpensesCardComponent', () => {
  let component: MyExpensesCardComponent;
  let fixture: ComponentFixture<MyExpensesCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyExpensesCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyExpensesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should xxxx', () => {
    expect(component).toBeTruthy();
    let test = getDummyExpenses();
    console.log(test)
    //component.expense = test.data[0]
  })
});


