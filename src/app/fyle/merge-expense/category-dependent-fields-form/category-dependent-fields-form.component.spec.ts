import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CategoryDependentFieldsFormComponent } from './category-dependent-fields-form.component';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Subscription } from 'rxjs';

describe('CategoryDependentFieldsFormComponent', () => {
  let component: CategoryDependentFieldsFormComponent;
  let fixture: ComponentFixture<CategoryDependentFieldsFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryDependentFieldsFormComponent],
      imports: [IonicModule.forRoot()],
      providers: [UntypedFormBuilder],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryDependentFieldsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isFieldTouched(): should return false if field is untouched', () => {
    component.categoryDependentFormGroup = new UntypedFormBuilder().group({
      location_1: new UntypedFormControl(''),
    });
    expect(component.isFieldTouched('location_1')).toBe(false);
  });

  it('ngOnInit(): should emit fieldsTouched', () => {
    spyOn(component.fieldsTouched, 'emit');
    // Using returnValues as we only need to return first value as true and all other subsequent values as false
    spyOn(component, 'isFieldTouched').and.returnValues(true);
    component.ngOnInit();
    component.categoryDependentFormGroup.patchValue({
      location_1: 'test',
    });
    expect(component.fieldsTouched.emit).toHaveBeenCalledOnceWith(['location_1']);
  });

  it('ngOnDestroy(): should unsubscribe from onChangeSub', () => {
    component.onChangeSub = new Subscription();
    spyOn(component.onChangeSub, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.onChangeSub.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('writeValue(): should patch value to form control', () => {
    component.categoryDependentFormGroup = new UntypedFormBuilder().group({
      location_1: new UntypedFormControl(''),
    });
    const newValue = new UntypedFormBuilder().group({
      location_1: new UntypedFormControl('Pune'),
    });
    spyOn(component.categoryDependentFormGroup, 'patchValue');
    component.writeValue(newValue);
    expect(component.categoryDependentFormGroup.patchValue).toHaveBeenCalledOnceWith(newValue);
  });

  it('registerOnChange(): should subscribe to value changes', () => {
    const onChange = (): void => {};
    spyOn(component.categoryDependentFormGroup.valueChanges, 'subscribe');
    component.registerOnChange(onChange);
    expect(component.categoryDependentFormGroup.valueChanges.subscribe).toHaveBeenCalledOnceWith(onChange);
  });

  it('registerOnTouched(): should set onTouched', () => {
    const onTouched = (): void => {};
    component.registerOnTouched(onTouched);
    expect(component.onTouched).toEqual(onTouched);
  });
});
