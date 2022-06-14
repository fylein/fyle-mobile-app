import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GenericFieldsFormComponent } from './generic-fields-form.component';

xdescribe('GenericFieldsFormComponent', () => {
  let component: GenericFieldsFormComponent;
  let fixture: ComponentFixture<GenericFieldsFormComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GenericFieldsFormComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(GenericFieldsFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
