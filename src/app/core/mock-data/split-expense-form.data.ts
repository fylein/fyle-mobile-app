import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

export const splitExpenseFormData1 = new UntypedFormGroup({
  amount: new UntypedFormControl(120),
  currency: new UntypedFormControl('INR'),
  percentage: new UntypedFormControl(60),
  txn_dt: new UntypedFormControl('2023-01-11'),
  category: new UntypedFormControl(''),
});

export const splitExpenseFormData2 = new UntypedFormGroup({
  amount: new UntypedFormControl(),
  currency: new UntypedFormControl('INR'),
  percentage: new UntypedFormControl(60),
  txn_dt: new UntypedFormControl('2023-01-11'),
  category: new UntypedFormControl(''),
});

export const splitExpenseFormData3 = new UntypedFormGroup({
  amount: new UntypedFormControl(120),
  currency: new UntypedFormControl('INR'),
  percentage: new UntypedFormControl(),
  txn_dt: new UntypedFormControl('2023-01-11'),
  category: new UntypedFormControl(''),
});

export const splitExpenseFormData4 = new UntypedFormGroup({
  amount: new UntypedFormControl(800),
  currency: new UntypedFormControl('INR'),
  percentage: new UntypedFormControl(40),
  txn_dt: new UntypedFormControl('2023-01-11'),
  category: new UntypedFormControl(''),
});

export const splitExpenseFormData5 = new UntypedFormGroup({
  amount: new UntypedFormControl(800),
  currency: new UntypedFormControl('INR'),
  percentage: new UntypedFormControl(90),
  txn_dt: new UntypedFormControl('2023-01-11'),
  category: new UntypedFormControl(''),
});

export const splitExpenseFormData6 = new UntypedFormGroup({
  amount: new UntypedFormControl(80),
  currency: new UntypedFormControl('INR'),
  percentage: new UntypedFormControl(96),
  txn_dt: new UntypedFormControl('2023-01-11'),
  category: new UntypedFormControl(''),
});
