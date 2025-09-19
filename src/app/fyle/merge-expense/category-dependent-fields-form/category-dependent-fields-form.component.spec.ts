import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CategoryDependentFieldsFormComponent } from './category-dependent-fields-form.component';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Subscription } from 'rxjs';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';

describe('CategoryDependentFieldsFormComponent', () => {
  let component: CategoryDependentFieldsFormComponent;
  let fixture: ComponentFixture<CategoryDependentFieldsFormComponent>;

  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [ TranslocoModule, CategoryDependentFieldsFormComponent],
      providers: [
        UntypedFormBuilder,
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryDependentFieldsFormComponent);
    component = fixture.componentInstance;

    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'categoryDependentFieldsForm.from': 'From',
        'categoryDependentFieldsForm.to': 'To',
        'categoryDependentFieldsForm.onwardDate': 'Onward date',
        'categoryDependentFieldsForm.returnDate': 'Return date',
        'categoryDependentFieldsForm.selectFrom': 'Select from',
        'categoryDependentFieldsForm.selectTo': 'Select to',
        'categoryDependentFieldsForm.selectOnwardDate': 'Select onward date',
        'categoryDependentFieldsForm.selectReturnDate': 'Select return date',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isFieldTouched(): should return false if field is untouched', () => {
    component.categoryDependentFormGroup = new UntypedFormBuilder().group({
      location_1: new UntypedFormControl(''),
    });
    expect(component.isFieldTouched('location_1')).toBeFalse();
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
