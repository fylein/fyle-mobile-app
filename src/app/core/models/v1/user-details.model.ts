export interface UserDetails {
  allowed_cidrs: string[];
  cluster_domain: string;
  name: string;
  org_id: string;
  org_user_id: string;
  proxy_org_user_id?: string;
  roles: string[];
  scopes: string[];
  tpa_id: string;
  tpa_name: string;
  user_id: string;
}
