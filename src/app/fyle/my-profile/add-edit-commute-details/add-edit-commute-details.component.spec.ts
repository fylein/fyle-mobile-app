import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddEditCommuteDetailsComponent } from './add-edit-commute-details.component';

describe('AddEditCommuteDetailsComponent', () => {
  let component: AddEditCommuteDetailsComponent;
  let fixture: ComponentFixture<AddEditCommuteDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditCommuteDetailsComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditCommuteDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
