import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddEditMileagePage } from './add-edit-mileage.page';

describe('AddEditMileagePage', () => {
  let component: AddEditMileagePage;
  let fixture: ComponentFixture<AddEditMileagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditMileagePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditMileagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
