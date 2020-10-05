import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyTripsPage } from './my-trips.page';

describe('MyTripsPage', () => {
  let component: MyTripsPage;
  let fixture: ComponentFixture<MyTripsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyTripsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyTripsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
