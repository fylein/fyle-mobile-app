export interface Org {
  id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  domain: string;
  currency: string;
  is_verified: boolean;
}
