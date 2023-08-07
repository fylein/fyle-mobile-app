import { FormControl, FormGroup } from '@angular/forms';

export const splitExpenseFormData1 = new FormGroup({
  amount: new FormControl(120),
  currency: new FormControl('INR'),
  percentage: new FormControl(60),
  txn_dt: new FormControl('2023-01-11'),
  category: new FormControl(''),
});

export const splitExpenseFormData2 = new FormGroup({
  amount: new FormControl(),
  currency: new FormControl('INR'),
  percentage: new FormControl(60),
  txn_dt: new FormControl('2023-01-11'),
  category: new FormControl(''),
});

export const splitExpenseFormData3 = new FormGroup({
  amount: new FormControl(120),
  currency: new FormControl('INR'),
  percentage: new FormControl(),
  txn_dt: new FormControl('2023-01-11'),
  category: new FormControl(''),
});

export const splitExpenseFormData4 = new FormGroup({
  amount: new FormControl(800),
  currency: new FormControl('INR'),
  percentage: new FormControl(40),
  txn_dt: new FormControl('2023-01-11'),
  category: new FormControl(''),
});

export const splitExpenseFormData5 = new FormGroup({
  amount: new FormControl(800),
  currency: new FormControl('INR'),
  percentage: new FormControl(90),
  txn_dt: new FormControl('2023-01-11'),
  category: new FormControl(''),
});

export const splitExpenseFormData6 = new FormGroup({
  amount: new FormControl(80),
  currency: new FormControl('INR'),
  percentage: new FormControl(96),
  txn_dt: new FormControl('2023-01-11'),
  category: new FormControl(''),
});
