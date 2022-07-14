export interface PolicyViolationComment {
  objectType: string;
  txnId: string;
  comment: { comment };
  notify: boolean;
}
