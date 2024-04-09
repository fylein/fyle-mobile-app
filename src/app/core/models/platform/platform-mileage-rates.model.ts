export interface PlatformMileageRates {
  id: number;
  org_id: string;
  created_at: Date;
  updated_at: Date;
  is_enabled: boolean;
  unit: string;
  vehicle_type?: string;
  code?: string;
  readableRate?: string;
  rate: number;
  slab_rates?: { rate: number; limit: number }[];
}

export enum MileageUnitEnum {
  KM = 'KM',
  MILES = 'MILES',
}
