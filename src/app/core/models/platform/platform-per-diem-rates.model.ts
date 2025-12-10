export interface PlatformPerDiemRates {
  id: number;
  org_id: string;
  created_at: Date;
  updated_at: Date;
  is_enabled: boolean;
  name: string;
  code?: string;
  description?: string;
  currency: string;
  rate: number;
  full_name?: string;
  readableRate?: string;
}
