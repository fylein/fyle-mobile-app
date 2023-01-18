export interface PerDiemRates {
  active: boolean;
  created_at: Date;
  currency: string;
  id: number;
  name: string;
  org_id: string;
  rate: number;
  updated_at: Date;
  full_name?: string;
  readableRate?: string;
}
