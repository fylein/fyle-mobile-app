export interface RecentLocalStorageItems {
  label: string;
  value: {
    code: any;
    created_at: Date;
    displayName: string;
    enabled: boolean;
    fyle_category: string;
    id: number;
    name: string;
    org_id: string;
    sub_category: string;
    updated_at: Date;
  };
  selected: boolean;
  custom: boolean;
}
