import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyAddEditTripPage } from './my-add-edit-trip.page';

describe('MyAddEditTripPage', () => {
  let component: MyAddEditTripPage;
  let fixture: ComponentFixture<MyAddEditTripPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyAddEditTripPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyAddEditTripPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
