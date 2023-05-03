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
import { dependentCustomProperties } from 'src/app/core/mock-data/custom-property.data';
import { ExpenseField } from 'src/app/core/models/v1/expense-field.model';

describe('DependentFieldsComponent', () => {
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
    component.txnCustomProperties = dependentCustomProperties;
    component.onPageExit$ = new Subject();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  fdescribe('addDependentFieldWithValue(): ', () => {
    let parentField = [];
    let dependentFieldDetails: {
      dependentField: ExpenseField;
      parentFieldValue: string;
    };
    beforeEach(() => {
      parentField = [
        {
          id: 219175,
          value: 'Project 1',
        },
        {
          id: 219199,
          value: 'Cost Code 1',
        },
      ];

      dependentFieldDetails = {
        dependentField: dependentCustomFields[1],
        parentFieldValue: parentField[1].value,
      };
    });

    it('should add a dependent field with its value', () => {
      const addDependentFieldSpy = spyOn(component, 'addDependentField').and.returnValues(null);
      const getDependentFieldSpy = spyOn(component, 'getDependentField').and.returnValues(
        of(dependentFieldDetails),
        of(null)
      );

      const addDependentFieldWithValueSpy = spyOn(component, 'addDependentFieldWithValue').and.callThrough();
      component.addDependentFieldWithValue(
        component.txnCustomProperties,
        component.dependentCustomFields,
        parentField[0]
      );

      expect(addDependentFieldSpy).toHaveBeenCalledTimes(2);
      expect(addDependentFieldSpy.calls.allArgs()).toEqual([
        [component.dependentCustomFields[0], parentField[0].value, dependentCustomProperties[1].value],
        [component.dependentCustomFields[1], parentField[1].value],
      ]);

      expect(getDependentFieldSpy).toHaveBeenCalledTimes(1);
      expect(getDependentFieldSpy.calls.allArgs()).toEqual([[parentField[1].id, parentField[1].value]]);

      expect(component.addDependentFieldWithValue).toHaveBeenCalledTimes(2);
      expect(addDependentFieldWithValueSpy.calls.allArgs()).toEqual([
        [component.txnCustomProperties, component.dependentCustomFields, parentField[0]],
        [component.txnCustomProperties, component.dependentCustomFields, parentField[1]],
      ]);
    });

    it('should show dependent field without selected value if it doesnt have a value in transaction object', () => {
      spyOn(component, 'addDependentField').and.returnValue(null);
      spyOn(component, 'getDependentField').and.returnValue(of(dependentFieldDetails));

      component.addDependentFieldWithValue(
        component.txnCustomProperties,
        component.dependentCustomFields,
        parentField[1]
      );

      expect(component.getDependentField).toHaveBeenCalledOnceWith(parentField[1].id, parentField[1].value);
      expect(component.addDependentField).toHaveBeenCalledOnceWith(
        component.dependentCustomFields[1],
        parentField[1].value
      );
    });

    it('should not add a new dependent field if it does not have any valid value for selected parent value', () => {
      spyOn(component, 'addDependentField').and.returnValue(null);
      spyOn(component, 'getDependentField').and.returnValue(of(null));

      component.addDependentFieldWithValue([], component.dependentCustomFields, parentField[0]);

      expect(component.getDependentField).toHaveBeenCalledOnceWith(parentField[0].id, parentField[0].value);
      expect(component.addDependentField).not.toHaveBeenCalled();
    });
  });

  describe('addDependentField(): ', () => {
    let parentFieldValue: string;
    let dependentFieldControl: FormGroup;

    beforeEach(() => {
      parentFieldValue = 'Project 1';

      dependentFieldControl = new FormGroup({
        id: new FormControl(dependentCustomFields[0].id),
        label: new FormControl(dependentCustomFields[0].field_name),
        parent_field_id: new FormControl(dependentCustomFields[0].parent_field_id),
        value: new FormControl(null, (dependentCustomFields[0].is_mandatory || null) && Validators.required),
      });

      formBuilder.group.and.returnValue(dependentFieldControl);
    });

    it('should add a new field and call onDependentFieldChanged() whenever the field changes', (done) => {
      const dependentField = {
        id: dependentCustomFields[0].id,
        parentFieldId: dependentCustomFields[0].parent_field_id,
        parentFieldValue,
        field: dependentCustomFields[0].field_name,
        mandatory: dependentCustomFields[0].is_mandatory,
        control: dependentFieldControl,
        placeholder: dependentCustomFields[0].placeholder,
      };

      const dependentFieldValue = {
        id: dependentCustomFields[0].id,
        label: dependentCustomFields[0].field_name,
        parent_field_id: dependentCustomFields[0].parent_field_id,
        value: 'Some new value',
      };

      spyOn(component, 'onDependentFieldChanged').and.returnValue(null);
      component.addDependentField(dependentCustomFields[0], parentFieldValue);
      fixture.detectChanges();

      const dependentFieldFg = component.dependentFieldsFormArray.at(
        component.dependentFieldsFormArray.length - 1
      ) as FormGroup;

      //This field should be the last field in dependentFields and formArray
      expect(component.dependentFields[component.dependentFields.length - 1]).toEqual(dependentField);
      expect(dependentFieldFg).toEqual(dependentFieldControl);

      dependentFieldFg.valueChanges.subscribe((result) => {
        expect(result).toEqual(dependentFieldValue);
        expect(component.onDependentFieldChanged).toHaveBeenCalledOnceWith(result);
        done();
      });

      dependentFieldFg.patchValue(dependentFieldValue);
      fixture.detectChanges();
    });

    it('should add a new non-mandatory dependent field', () => {
      component.addDependentField(dependentCustomFields[0], parentFieldValue);
      fixture.detectChanges();

      //The formControl should not have any validators
      expect(dependentFieldControl.controls.value.hasValidator(null)).toBeTrue();
    });

    it('should add a new mandatory dependent field', () => {
      const mandatoryDependentField = {
        ...dependentCustomFields[0],
        is_mandatory: true,
      };

      const mandatoryDependentFieldControl = new FormGroup({
        id: new FormControl(mandatoryDependentField.id),
        label: new FormControl(mandatoryDependentField.field_name),
        parent_field_id: new FormControl(mandatoryDependentField.parent_field_id),
        value: new FormControl(null, (mandatoryDependentField.is_mandatory || null) && Validators.required),
      });

      formBuilder.group.and.returnValue(mandatoryDependentFieldControl);

      component.addDependentField(mandatoryDependentField, parentFieldValue);
      fixture.detectChanges();

      //Dependent field should be marked as mandatory
      expect(mandatoryDependentFieldControl.controls.value.hasValidator(Validators.required)).toBeTrue();
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

  describe('removeAllDependentFields(): ', () => {
    let initialDependentFieldsFormArray: FormArray;
    let initialDependentFields = [];
    beforeEach(() => {
      component.dependentFieldsFormArray = new FormArray([]);
      component.dependentFields = [];
      const parentFieldValues = ['Project 1', 'Cost Code 1'];

      initialDependentFieldsFormArray = new FormArray([]);
      initialDependentFields = [];

      //Create formArray and object array with two dependent fields
      for (let i = 0; i < 2; i++) {
        const dependentFieldControl = new FormGroup({
          id: new FormControl(dependentCustomFields[i].id),
          label: new FormControl(dependentCustomFields[i].field_name),
          parent_field_id: new FormControl(dependentCustomFields[i].parent_field_id),
          value: new FormControl(null, (dependentCustomFields[i].is_mandatory || null) && Validators.required),
        });

        const dependentField = {
          id: dependentCustomFields[i].id,
          parentFieldId: dependentCustomFields[i].parent_field_id,
          parentFieldValue: parentFieldValues[i],
          field: dependentCustomFields[i].field_name,
          mandatory: dependentCustomFields[i].is_mandatory,
          control: dependentFieldControl,
          placeholder: dependentCustomFields[i].placeholder,
        };

        component.dependentFieldsFormArray.push(dependentFieldControl);
        component.dependentFields.push(dependentField);

        initialDependentFieldsFormArray.push(dependentFieldControl);
        initialDependentFields.push(dependentField);
      }
    });

    it('should remove all dependent fields after the updated field', () => {
      component.removeAllDependentFields(0);
      expect(component.dependentFieldsFormArray.length).toEqual(1);
      expect(component.dependentFieldsFormArray.at(0)).toEqual(initialDependentFieldsFormArray.at(0));

      expect(component.dependentFields.length).toEqual(1);
      expect(component.dependentFields[0]).toEqual(initialDependentFields[0]);
    });

    it('should not remove any field if last dependent field is updated', () => {
      component.removeAllDependentFields(1);
      expect(component.dependentFieldsFormArray.length).toEqual(2);
      expect(component.dependentFieldsFormArray.at(0)).toEqual(initialDependentFieldsFormArray.at(0));
      expect(component.dependentFieldsFormArray.at(1)).toEqual(initialDependentFieldsFormArray.at(1));

      expect(component.dependentFields.length).toEqual(2);
      expect(component.dependentFields).toEqual(initialDependentFields);
    });
  });

  describe('onDependentFieldChanged(): ', () => {
    beforeEach(() => {
      component.dependentFieldsFormArray = new FormArray([]);

      for (let i = 0; i < 2; i++) {
        const dependentFieldControl = new FormGroup({
          id: new FormControl(dependentCustomFields[i].id),
          label: new FormControl(dependentCustomFields[i].field_name),
          parent_field_id: new FormControl(dependentCustomFields[i].parent_field_id),
          value: new FormControl(null, (dependentCustomFields[i].is_mandatory || null) && Validators.required),
        });
        component.dependentFieldsFormArray.push(dependentFieldControl);
      }

      spyOn(component, 'removeAllDependentFields').and.returnValue(null);
      spyOn(component, 'addDependentField').and.returnValue(null);
    });

    it('should create a new dependent field when a value is selected for parent for the first time', () => {
      const data = {
        id: 219199,
        label: 'Cost Code',
        parent_field_id: 219175,
        value: 'Cost Code 1',
      };

      const dependentFieldDetails = {
        dependentField: dependentCustomFields[1],
        parentFieldValue: data.value,
      };

      component.dependentFieldsFormArray.removeAt(1);
      spyOn(component, 'getDependentField').and.returnValue(of(dependentFieldDetails));

      component.onDependentFieldChanged(data);
      fixture.detectChanges();

      expect(component.removeAllDependentFields).not.toHaveBeenCalled();
      expect(component.getDependentField).toHaveBeenCalledOnceWith(data.id, data.value);

      component.getDependentField(data.id, data.value).subscribe((result) => {
        expect(component.isDependentFieldLoading).toBeFalse();
        expect(result).toEqual(dependentFieldDetails);
        expect(component.addDependentField).toHaveBeenCalledOnceWith(result.dependentField, result.parentFieldValue);
      });
    });

    it('should not add a new dependent field for the last field in the chain', () => {
      const data = {
        id: 219200,
        label: 'Cost Area',
        parent_field_id: 219199,
        value: 'Cost Area 2',
      };

      spyOn(component, 'getDependentField').and.returnValue(of(null));

      component.onDependentFieldChanged(data);
      fixture.detectChanges();

      expect(component.removeAllDependentFields).not.toHaveBeenCalled();
      expect(component.getDependentField).toHaveBeenCalledOnceWith(data.id, data.value);

      component.getDependentField(data.id, data.value).subscribe((result) => {
        expect(component.isDependentFieldLoading).toBeFalse();
        expect(result).toEqual(null);
        expect(component.addDependentField).not.toHaveBeenCalled();
      });
    });

    it('should remove the child dependent fields and show new child when value of parent field is changed', () => {
      const data = {
        id: 219199,
        label: 'Cost Code',
        parent_field_id: 219175,
        value: 'Cost Code 2',
      };

      spyOn(component, 'getDependentField').and.returnValue(of(null));

      component.onDependentFieldChanged(data);
      fixture.detectChanges();

      expect(component.removeAllDependentFields).toHaveBeenCalledOnceWith(0);
      expect(component.getDependentField).toHaveBeenCalledOnceWith(data.id, data.value);

      component.getDependentField(data.id, data.value).subscribe((result) => {
        expect(component.isDependentFieldLoading).toBeFalse();
        expect(result).toEqual(null);
        expect(component.addDependentField).not.toHaveBeenCalled();
      });
    });
  });
});
