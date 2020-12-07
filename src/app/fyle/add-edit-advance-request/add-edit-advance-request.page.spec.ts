import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddEditAdvanceRequestPage } from './add-edit-advance-request.page';

describe('AddEditAdvanceRequestPage', () => {
  let component: AddEditAdvanceRequestPage;
  let fixture: ComponentFixture<AddEditAdvanceRequestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditAdvanceRequestPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditAdvanceRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
