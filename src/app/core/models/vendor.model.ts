export interface Vendor {
  id: number;
  cin?: any;
  tin?: any;
  display_name?: string;
  other_names?: string;
  creator_id: string;
  created_at: Date;
  updated_at: Date;
  default_category?: any;
  verified?: boolean; 
}