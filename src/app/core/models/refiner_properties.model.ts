export interface RefinerProperties {
  actionName: string;
}

export interface IdentifyUserPayload {
  id: string;
  email: string;
  name: string;
  account: {
    company_id: string;
    company_name: string;
    region: string;
  };
  source: string;
  is_admin: 'T' | 'F';
  action_name: string;
}
