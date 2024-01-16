import { UntypedFormBuilder } from '@angular/forms';
import { CustomInputsField } from '../models/custom-inputs-field.model';
const formBuilder = new UntypedFormBuilder();

export const customInputsFieldData1: CustomInputsField[] = [
  {
    control: formBuilder.group({
      name: 'Merchant',
      value: 'Jio',
    }),
    id: '1',
    mandatory: false,
    name: 'Merchant',
    options: [],
    placeholder: 'placeholder',
    prefix: 'prefix',
    type: 'text',
    value: 'Jio',
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const expectedCustomInputsFieldWithoutControl = customInputsFieldData1.map(({ control, ...otherProps }) => ({
  ...otherProps,
}));

export const expectedCustomInputsFieldControlValues = customInputsFieldData1.map(
  ({ control }: { control: { value: { name: string; value: string } } }) => control.value
);
