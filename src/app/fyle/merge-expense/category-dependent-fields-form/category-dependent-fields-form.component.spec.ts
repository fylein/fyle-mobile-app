import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CategoryDependentFieldsFormComponent } from './category-dependent-fields-form.component';

xdescribe('CategoryDependentFieldsFormComponent', () => {
  let component: CategoryDependentFieldsFormComponent;
  let fixture: ComponentFixture<CategoryDependentFieldsFormComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CategoryDependentFieldsFormComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(CategoryDependentFieldsFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
