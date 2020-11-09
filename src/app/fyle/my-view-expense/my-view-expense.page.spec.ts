import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyViewExpensePage } from './my-view-expense.page';

describe('MyViewExpensePage', () => {
  let component: MyViewExpensePage;
  let fixture: ComponentFixture<MyViewExpensePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyViewExpensePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyViewExpensePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
