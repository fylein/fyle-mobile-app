export interface SamlResponse {
  error: boolean;
  response_status_code: string;
  access_token: string;
  signup: boolean;
  redirect_url: string;
  refresh_token: string;
  cluster_domain: string;
  org_id: string;
}
