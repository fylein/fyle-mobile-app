import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyExpensesSearchFilterComponent } from './my-expenses-search-filter.component';

describe('MyExpensesSearchFilterComponent', () => {
  let component: MyExpensesSearchFilterComponent;
  let fixture: ComponentFixture<MyExpensesSearchFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyExpensesSearchFilterComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyExpensesSearchFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
