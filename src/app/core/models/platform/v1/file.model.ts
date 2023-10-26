export interface File {
  id: string;
  org_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  type: FileType;
  content_type: string;
}

enum FileType {
  INTEGRATION = 'INTEGRATION',
  RECEIPT = 'RECEIPT',
}
