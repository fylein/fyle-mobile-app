import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProjectDependentCustomFieldsFormComponent } from './project-dependent-custom-fields-form.component';

xdescribe('ProjectDependentCustomFieldsFormComponent', () => {
  let component: ProjectDependentCustomFieldsFormComponent;
  let fixture: ComponentFixture<ProjectDependentCustomFieldsFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectDependentCustomFieldsFormComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDependentCustomFieldsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
