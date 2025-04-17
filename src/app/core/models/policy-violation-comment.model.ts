export interface PolicyViolationComment {
  objectType: string;
  txnId: string;
  comment: { comment: string };
  notify: boolean;
}
