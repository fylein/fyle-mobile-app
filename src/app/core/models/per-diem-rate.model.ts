export interface PerDiemRate {
  id: number;
  name: string;
  org_id: string;
  currency: string;
  rate: number;
  created_at: Date;
  updated_at: Date;
  active: boolean;
}
