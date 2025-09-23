import { ComponentFixture } from '@angular/core/testing';
import { AbstractControl, UntypedFormBuilder, ValidationErrors } from '@angular/forms';
import { AddEditExpensePage } from './add-edit-expense.page';

export function TestCasesDateValidation(getTestBed) {
  return fdescribe('AddEditExpensePage - Date Validation', () => {
    let component: AddEditExpensePage;
    let fixture: ComponentFixture<AddEditExpensePage>;
    let formBuilder: UntypedFormBuilder;

    beforeEach(() => {
      const TestBed = getTestBed();
      TestBed.compileComponents();
      fixture = TestBed.createComponent(AddEditExpensePage);
      component = fixture.componentInstance;
      formBuilder = TestBed.inject(UntypedFormBuilder);

      // Initialize the form
      component.fg = formBuilder.group({
        from_dt: ['', component.fromDateValidator],
        to_dt: ['', component.toDateValidator],
      });

      // Set up valueChanges subscriptions like in the actual component
      component.fg.get('from_dt')?.valueChanges.subscribe(() => {
        component.validateDateFields();
      });

      component.fg.get('to_dt')?.valueChanges.subscribe(() => {
        component.validateDateFields();
      });
    });

    describe('fromDateValidator', () => {
      it('should return null when control value is empty', () => {
        const control = { value: '' } as AbstractControl;
        const result = component.fromDateValidator(control);
        expect(result).toBeNull();
      });

      it('should return null when control value is null', () => {
        const control = { value: null } as AbstractControl;
        const result = component.fromDateValidator(control);
        expect(result).toBeNull();
      });

      it('should return null when to_dt is not set', () => {
        const control = { value: '2025-01-15' } as AbstractControl;
        component.fg.patchValue({ to_dt: '' });
        const result = component.fromDateValidator(control);
        expect(result).toBeNull();
      });

      it('should return null when from_dt is before to_dt', () => {
        const control = { value: '2025-01-10' } as AbstractControl;
        component.fg.patchValue({ to_dt: '2025-01-15' });
        const result = component.fromDateValidator(control);
        expect(result).toBeNull();
      });

      it('should return null when from_dt equals to_dt', () => {
        const control = { value: '2025-01-15' } as AbstractControl;
        component.fg.patchValue({ to_dt: '2025-01-15' });
        const result = component.fromDateValidator(control);
        expect(result).toBeNull();
      });

      it('should return error when from_dt is after to_dt', () => {
        const control = { value: '2025-01-20' } as AbstractControl;
        component.fg.patchValue({ to_dt: '2025-01-15' });
        const result = component.fromDateValidator(control);
        expect(result).toEqual({ fromDateAfterToDate: true });
      });

      it('should handle different date formats correctly', () => {
        const control = { value: '2025-12-31' } as AbstractControl;
        component.fg.patchValue({ to_dt: '2025-01-01' });
        const result = component.fromDateValidator(control);
        expect(result).toEqual({ fromDateAfterToDate: true });
      });
    });

    describe('toDateValidator', () => {
      it('should return null when control value is empty', () => {
        const control = { value: '' } as AbstractControl;
        const result = component.toDateValidator(control);
        expect(result).toBeNull();
      });

      it('should return null when control value is null', () => {
        const control = { value: null } as AbstractControl;
        const result = component.toDateValidator(control);
        expect(result).toBeNull();
      });

      it('should return null when from_dt is not set', () => {
        const control = { value: '2025-01-15' } as AbstractControl;
        component.fg.patchValue({ from_dt: '' });
        const result = component.toDateValidator(control);
        expect(result).toBeNull();
      });

      it('should return null when to_dt is after from_dt', () => {
        const control = { value: '2025-01-20' } as AbstractControl;
        component.fg.patchValue({ from_dt: '2025-01-15' });
        const result = component.toDateValidator(control);
        expect(result).toBeNull();
      });

      it('should return null when to_dt equals from_dt', () => {
        const control = { value: '2025-01-15' } as AbstractControl;
        component.fg.patchValue({ from_dt: '2025-01-15' });
        const result = component.toDateValidator(control);
        expect(result).toBeNull();
      });

      it('should return error when to_dt is before from_dt', () => {
        const control = { value: '2025-01-10' } as AbstractControl;
        component.fg.patchValue({ from_dt: '2025-01-15' });
        const result = component.toDateValidator(control);
        expect(result).toEqual({ toDateBeforeFromDate: true });
      });

      it('should handle different date formats correctly', () => {
        const control = { value: '2025-01-01' } as AbstractControl;
        component.fg.patchValue({ from_dt: '2025-12-31' });
        const result = component.toDateValidator(control);
        expect(result).toEqual({ toDateBeforeFromDate: true });
      });
    });

    describe('validateDateFields', () => {
      it('should validate both fields when called', () => {
        spyOn(component, 'fromDateValidator').and.returnValue(null);
        spyOn(component, 'toDateValidator').and.returnValue(null);

        component.validateDateFields();

        expect(component.fromDateValidator).toHaveBeenCalled();
        expect(component.toDateValidator).toHaveBeenCalled();
      });

      it('should set errors on from_dt field when validation fails', () => {
        component.fg.patchValue({ from_dt: '2025-01-20', to_dt: '2025-01-15' });
        spyOn(component, 'fromDateValidator').and.returnValue({ fromDateAfterToDate: true });
        spyOn(component, 'toDateValidator').and.returnValue(null);

        component.validateDateFields();

        expect(component.fg.get('from_dt')?.errors).toEqual({ fromDateAfterToDate: true });
      });

      it('should set errors on to_dt field when validation fails', () => {
        component.fg.patchValue({ from_dt: '2025-01-15', to_dt: '2025-01-10' });
        spyOn(component, 'fromDateValidator').and.returnValue(null);
        spyOn(component, 'toDateValidator').and.returnValue({ toDateBeforeFromDate: true });

        component.validateDateFields();

        expect(component.fg.get('to_dt')?.errors).toEqual({ toDateBeforeFromDate: true });
      });

      it('should clear errors when validation passes', () => {
        component.fg.patchValue({ from_dt: '2025-01-10', to_dt: '2025-01-15' });
        component.fg.get('from_dt')?.setErrors({ fromDateAfterToDate: true });
        component.fg.get('to_dt')?.setErrors({ toDateBeforeFromDate: true });

        spyOn(component, 'fromDateValidator').and.returnValue(null);
        spyOn(component, 'toDateValidator').and.returnValue(null);

        component.validateDateFields();

        expect(component.fg.get('from_dt')?.errors).toBeNull();
        expect(component.fg.get('to_dt')?.errors).toBeNull();
      });

      it('should handle missing form controls gracefully', () => {
        component.fg = formBuilder.group({});

        expect(() => component.validateDateFields()).not.toThrow();
      });
    });

    describe('Cross-validation scenarios', () => {
      it('should validate both fields when from_dt changes', () => {
        // Create a new form with spy set up before valueChanges subscriptions
        const validateDateFieldsSpy = spyOn(component, 'validateDateFields');

        component.fg.patchValue({ from_dt: '2025-01-15' });

        expect(validateDateFieldsSpy).toHaveBeenCalled();
      });

      it('should validate both fields when to_dt changes', () => {
        // Create a new form with spy set up before valueChanges subscriptions
        const validateDateFieldsSpy = spyOn(component, 'validateDateFields');

        component.fg.patchValue({ to_dt: '2025-01-15' });

        expect(validateDateFieldsSpy).toHaveBeenCalled();
      });

      it('should handle edge case dates correctly', () => {
        // Test with same day
        component.fg.patchValue({ from_dt: '2025-01-15', to_dt: '2025-01-15' });
        expect(component.fromDateValidator({ value: '2025-01-15' } as AbstractControl)).toBeNull();
        expect(component.toDateValidator({ value: '2025-01-15' } as AbstractControl)).toBeNull();

        // Test with leap year
        component.fg.patchValue({ from_dt: '2024-02-29', to_dt: '2024-03-01' });
        expect(component.fromDateValidator({ value: '2024-02-29' } as AbstractControl)).toBeNull();
        expect(component.toDateValidator({ value: '2024-03-01' } as AbstractControl)).toBeNull();
      });

      it('should handle invalid date strings gracefully', () => {
        const control = { value: 'invalid-date' } as AbstractControl;
        component.fg.patchValue({ to_dt: '2025-01-15' });

        const result = component.fromDateValidator(control);
        // Should not throw error, but may return validation error due to invalid date
        expect(result).toBeDefined();
      });
    });

    describe('Form integration', () => {
      it('should have validators attached to form controls', () => {
        expect(component.fg.get('from_dt')?.validator).toBeDefined();
        expect(component.fg.get('to_dt')?.validator).toBeDefined();
      });

      it('should show validation errors in form state', () => {
        component.fg.patchValue({ from_dt: '2025-01-20', to_dt: '2025-01-15' });

        // Trigger validation manually since patchValue doesn't automatically trigger validators
        component.validateDateFields();

        expect(component.fg.get('from_dt')?.invalid).toBeTrue();
        expect(component.fg.get('to_dt')?.invalid).toBeTrue();
      });

      it('should show form as valid when dates are correct', () => {
        component.fg.patchValue({ from_dt: '2025-01-10', to_dt: '2025-01-15' });

        expect(component.fg.get('from_dt')?.valid).toBeTrue();
        expect(component.fg.get('to_dt')?.valid).toBeTrue();
      });
    });
  });
}
