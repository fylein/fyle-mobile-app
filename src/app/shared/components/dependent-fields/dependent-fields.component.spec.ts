import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { DependentFieldsComponent } from './dependent-fields.component';
import { DependentFieldComponent } from './dependent-field/dependent-field.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { dependentCustomFields } from 'src/app/core/mock-data/expense-field.data';
import { dependentFieldOptionsForCostCode } from 'src/app/core/mock-data/dependent-field-value.data';
import { of } from 'rxjs';

fdescribe('DependentFieldsComponent', () => {
  let component: DependentFieldsComponent;
  let fixture: ComponentFixture<DependentFieldsComponent>;
  let dependentFieldsService: jasmine.SpyObj<DependentFieldsService>;
  let formBuilder: jasmine.SpyObj<FormBuilder>;

  beforeEach(waitForAsync(() => {
    const dependentFieldsServiceSpy = jasmine.createSpyObj('DependentFieldsService', ['getOptionsForDependentField']);
    TestBed.configureTestingModule({
      declarations: [DependentFieldsComponent, DependentFieldComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [
        {
          provide: DependentFieldsService,
          useValue: dependentFieldsServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DependentFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    dependentFieldsService = TestBed.inject(DependentFieldsService) as jasmine.SpyObj<DependentFieldsService>;
    component.dependentCustomFields = dependentCustomFields;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('addDependentFieldWithValue', () => {});

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
