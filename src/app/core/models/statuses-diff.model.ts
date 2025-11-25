export interface DisplayObject {
  display: string;
}

export type ValueType = string | number | boolean | null | undefined | DisplayObject | unknown[];

