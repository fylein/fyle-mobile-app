import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyExpensesSortFilterComponent } from './my-expenses-sort-filter.component';

describe('MyExpensesSortFilterComponent', () => {
  let component: MyExpensesSortFilterComponent;
  let fixture: ComponentFixture<MyExpensesSortFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyExpensesSortFilterComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyExpensesSortFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
