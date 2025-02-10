export interface IdentifyUserPayload {
  id: string;
  orgUserId: string;
  orgId: string;
  account: {
    company_id: string;
    region: string;
  };
  source: string;
  is_admin: 'T' | 'F';
  action_name: string;
}
