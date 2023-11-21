export interface CustomFields {
  name: string;
  value: string | string[] | boolean | number | Record<string, string | string[] | boolean>;
  type?: string;
  is_enabled?: boolean;
}
