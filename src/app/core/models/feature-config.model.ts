export interface FeatureConfig<T> {
  feature: string;
  key: string;
  value: T;
  is_shared: boolean;
  sub_feature: string;
  target_client: string;
  org_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
