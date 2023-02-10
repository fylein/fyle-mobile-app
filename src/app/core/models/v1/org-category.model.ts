export interface OrgCategory {
  id: number;
  created_at: Date;
  updated_at: Date;
  org_id: string;
  name: string;
  code: string;
  fyle_category?: string;
  sub_category: string;
  enabled: boolean;
  creator_id?: string;
  last_updated_by?: string;
  displayName?: string;
}

export interface OrgCategoryListItem {
  label: string;
  value: OrgCategory;
  selected?: boolean;
}
