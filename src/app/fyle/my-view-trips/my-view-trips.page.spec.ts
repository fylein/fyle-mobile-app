import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyViewTripsPage } from './my-view-trips.page';

describe('MyViewTripsPage', () => {
  let component: MyViewTripsPage;
  let fixture: ComponentFixture<MyViewTripsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyViewTripsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyViewTripsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
