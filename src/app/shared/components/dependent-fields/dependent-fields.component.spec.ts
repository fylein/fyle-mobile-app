import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { DependentFieldsComponent } from './dependent-fields.component';
import { DependentFieldComponent } from './dependent-field/dependent-field.component';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { dependentCustomFields } from 'src/app/core/mock-data/expense-field.data';
import { dependentFieldOptionsForCostCode } from 'src/app/core/mock-data/dependent-field-value.data';
import { Subject, of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';

fdescribe('DependentFieldsComponent', () => {
  let component: DependentFieldsComponent;
  let fixture: ComponentFixture<DependentFieldsComponent>;
  let dependentFieldsService: jasmine.SpyObj<DependentFieldsService>;
  let formBuilder: jasmine.SpyObj<FormBuilder>;

  beforeEach(waitForAsync(() => {
    const dependentFieldsServiceSpy = jasmine.createSpyObj('DependentFieldsService', ['getOptionsForDependentField']);
    const formBuilderSpy = jasmine.createSpyObj('FormBuilder', ['group']);
    TestBed.configureTestingModule({
      declarations: [DependentFieldsComponent, DependentFieldComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule, FormsModule, MatIconModule, MatIconTestingModule],
      providers: [
        {
          provide: DependentFieldsService,
          useValue: dependentFieldsServiceSpy,
        },
        {
          provide: FormBuilder,
          useValue: formBuilderSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DependentFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    dependentFieldsService = TestBed.inject(DependentFieldsService) as jasmine.SpyObj<DependentFieldsService>;
    formBuilder = TestBed.inject(FormBuilder) as jasmine.SpyObj<FormBuilder>;
    component.dependentCustomFields = dependentCustomFields;

    component.dependentFieldsFormArray = new FormArray([]);
    component.parentFieldId = 219175;
    component.parentFieldValue = 'Project 1';
    component.txnCustomProperties = [];
    component.onPageExit$ = new Subject();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('addDependentFieldWithValue(): ', () => {
    it('should add a new non-mandatory dependent field', () => {
      const parentFieldValue = 'Project 1';

      const dependentFieldControl = new FormGroup({
        id: new FormControl(dependentCustomFields[0].id),
        label: new FormControl(dependentCustomFields[0].field_name),
        parent_field_id: new FormControl(dependentCustomFields[0].parent_field_id),
        value: new FormControl(null, (dependentCustomFields[0].is_mandatory || null) && Validators.required),
      });

      formBuilder.group.and.returnValue(dependentFieldControl);

      const dependentField = {
        id: dependentCustomFields[0].id,
        parentFieldId: dependentCustomFields[0].parent_field_id,
        parentFieldValue,
        field: dependentCustomFields[0].field_name,
        mandatory: dependentCustomFields[0].is_mandatory,
        control: dependentFieldControl,
        placeholder: dependentCustomFields[0].placeholder,
      };

      component.addDependentField(dependentCustomFields[0], parentFieldValue);
      fixture.detectChanges();

      //This field should be the last field in dependentFields and formArray
      expect(component.dependentFields[component.dependentFields.length - 1]).toEqual(dependentField);
      expect(component.dependentFieldsFormArray.at(component.dependentFieldsFormArray.length - 1)).toEqual(
        dependentFieldControl
      );

      //The formControl should not have any validators
      expect(dependentFieldControl.controls.value.hasValidator(null)).toBeTrue();

      // spyOn(component, 'onDependentFieldChanged').and.returnValue(null);
      // expect(component.onDependentFieldChanged).toHaveBeenCalledOnceWith({
      //   id: 32,
      //   label: 'string',
      //   parent_field_id: 13313,
      //   value: '1313',
      // });
    });

    it('should add a new mandatory dependent field', () => {
      const parentFieldValue = 'Project 1';
      const mandatoryDependentField = {
        ...dependentCustomFields[0],
        is_mandatory: true,
      };

      const dependentFieldControl = new FormGroup({
        id: new FormControl(mandatoryDependentField.id),
        label: new FormControl(mandatoryDependentField.field_name),
        parent_field_id: new FormControl(mandatoryDependentField.parent_field_id),
        value: new FormControl(null, (mandatoryDependentField.is_mandatory || null) && Validators.required),
      });

      formBuilder.group.and.returnValue(dependentFieldControl);

      component.addDependentField(mandatoryDependentField, parentFieldValue);
      fixture.detectChanges();

      //Dependent field should be marked as mandatory
      expect(dependentFieldControl.controls.value.hasValidator(Validators.required)).toBeTrue();
    });
  });

  describe('getDependentField(): ', () => {
    it('should return dependent field for selected value of parent field', () => {
      const parentFieldId = 219175;
      const parentFieldValue = 'Project 1';
      dependentFieldsService.getOptionsForDependentField.and.returnValue(of(dependentFieldOptionsForCostCode));
      component.getDependentField(parentFieldId, parentFieldValue).subscribe((result) => {
        expect(result).toEqual({ dependentField: dependentCustomFields[0], parentFieldValue });
      });
      expect(dependentFieldsService.getOptionsForDependentField).toHaveBeenCalledOnceWith({
        fieldId: dependentCustomFields[0].id,
        parentFieldId,
        parentFieldValue,
        searchQuery: '',
      });
    });

    it('should return null if no dependent field exists for selected value of parent field', () => {
      const parentFieldId = 219200;
      const parentFieldValue = 'Cost Area 1';
      component.getDependentField(parentFieldId, parentFieldValue).subscribe((result) => {
        expect(result).toEqual(null);
      });
      expect(dependentFieldsService.getOptionsForDependentField).not.toHaveBeenCalled();
    });

    it('should return null if dependent field does not have any value for selected value of parent field', () => {
      const parentFieldId = 219199;
      const parentFieldValue = 'Cost Code 2';
      dependentFieldsService.getOptionsForDependentField.and.returnValue(of([]));
      component.getDependentField(parentFieldId, parentFieldValue).subscribe((result) => {
        expect(result).toEqual(null);
      });
      expect(dependentFieldsService.getOptionsForDependentField).toHaveBeenCalledOnceWith({
        fieldId: dependentCustomFields[1].id,
        parentFieldId,
        parentFieldValue,
        searchQuery: '',
      });
    });

    it('should return null if dependent field does not have any value for selected value of parent field and api returns null', () => {
      const parentFieldId = 219199;
      const parentFieldValue = 'Cost Code 2';
      dependentFieldsService.getOptionsForDependentField.and.returnValue(of(null));
      component.getDependentField(parentFieldId, parentFieldValue).subscribe((result) => {
        expect(result).toEqual(null);
      });
      expect(dependentFieldsService.getOptionsForDependentField).toHaveBeenCalledOnceWith({
        fieldId: dependentCustomFields[1].id,
        parentFieldId,
        parentFieldValue,
        searchQuery: '',
      });
    });
  });

  xit('addDependentField', () => {});

  xit('removeAllDependentFields', () => {});
});
