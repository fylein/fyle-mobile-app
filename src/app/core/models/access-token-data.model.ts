export interface AccessTokenData {
  iat: number;
  iss: string;
  user_id: string;
  org_user_id: string;
  org_id: string;
  proxy_org_user_id?: string;
  roles?: string;
  scopes: string;
  allowed_CIDRs: string;
  version: string;
  cluster_domain: string;
  exp: number;
}
