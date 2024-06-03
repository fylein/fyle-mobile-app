import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewDependentFieldsComponent } from './view-dependent-fields.component';

describe('ViewDependentFieldsComponent', () => {
  let component: ViewDependentFieldsComponent;
  let fixture: ComponentFixture<ViewDependentFieldsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDependentFieldsComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewDependentFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should set parentFieldIcon to building by default', () => {
    expect(component.parentFieldIcon).toEqual('building');
  });

  it('should set parentFieldIcon to list if parent field type is project', () => {
    component.parentFieldType = 'PROJECT';
    component.ngOnInit();
    expect(component.parentFieldIcon).toEqual('list');
  });
});
