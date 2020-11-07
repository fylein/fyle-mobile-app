import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyViewMileagePage } from './my-view-mileage.page';

describe('MyViewMileagePage', () => {
  let component: MyViewMileagePage;
  let fixture: ComponentFixture<MyViewMileagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyViewMileagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyViewMileagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
