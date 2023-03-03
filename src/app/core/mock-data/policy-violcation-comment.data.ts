import { PolicyViolationComment } from '../models/policy-violation-comment.model';

export const violcationComment1: PolicyViolationComment = {
  objectType: 'reports',
  txnId: 'rpkpSa8guCuR',
  comment: {
    comment: 'a comment',
  },
  notify: false,
};

export const violcationComment2: PolicyViolationComment = {
  objectType: 'transactions',
  txnId: 'txxkBruL0EO9',
  comment: {
    comment: 'Policy violation explanation: another comment',
  },
  notify: true,
};

export const violcationComment3: PolicyViolationComment = {
  objectType: 'transactions',
  txnId: 'txNVtsqF8Siq',
  comment: {
    comment: 'No policy violation explanation provided',
  },
  notify: true,
};
