export interface AuthResponse {
  access_token?: string;
  signup?: boolean;
  redirect_url?: string;
  refresh_token?: string;
  cluster_domain?: string;
  org_id?: string;
  scopes?: Array<'SUBMIT' | 'APPROVE' | 'ALL'> | null;
}
