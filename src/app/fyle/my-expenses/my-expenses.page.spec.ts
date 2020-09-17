import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyExpensesPage } from './my-expenses.page';

describe('MyExpensesPage', () => {
  let component: MyExpensesPage;
  let fixture: ComponentFixture<MyExpensesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyExpensesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyExpensesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
