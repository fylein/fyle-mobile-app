export interface VirtualSelectOptionValues {
  display_name: string;
  active: boolean;
  code: string;
  created_at: string;
  description: string;
  id: number;
  name: string;
  org_id: string;
  updated_at: string;
  displayName: string;
  enabled: boolean;
  fyle_category: string;
  sub_category: string;
}

export interface SelectionReturnType {
  label: string;
  selected: boolean;
  value: Partial<VirtualSelectOptionValues>;
}
