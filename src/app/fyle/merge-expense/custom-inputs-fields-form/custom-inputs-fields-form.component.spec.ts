import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CustomInputsFieldsFormComponent } from './custom-inputs-fields-form.component';

describe('CustomInputsFieldsFormComponent', () => {
  let component: CustomInputsFieldsFormComponent;
  let fixture: ComponentFixture<CustomInputsFieldsFormComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CustomInputsFieldsFormComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(CustomInputsFieldsFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
