export interface File {
  id: string;
  org_id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  type: FileType;
  content_type: string;
}

export enum FileType {
  RECEIPT = 'RECEIPT',
  INTEGRATION = 'INTEGRATION',
}
