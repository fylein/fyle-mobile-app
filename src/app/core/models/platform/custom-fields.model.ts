import { CustomFieldTypes } from '../../enums/platform/v1/custom-fields-type.enum';

export interface CustomFields {
  name: string;
  value: string | string[] | boolean | number | Record<string, string | string[] | boolean>;
  type: CustomFieldTypes;
  is_enabled: boolean;
}
