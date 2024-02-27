import { PolicyViolationComment } from '../models/policy-violation-comment.model';

export const violationComment1: PolicyViolationComment = {
  objectType: 'reports',
  txnId: 'rpkpSa8guCuR',
  comment: {
    comment: 'a comment',
  },
  notify: false,
};

export const violationComment2: PolicyViolationComment = {
  objectType: 'transactions',
  txnId: 'txxkBruL0EO9',
  comment: {
    comment: 'Policy violation explanation: another comment',
  },
  notify: true,
};

export const violationComment3: PolicyViolationComment = {
  objectType: 'transactions',
  txnId: 'txNVtsqF8Siq',
  comment: {
    comment: 'No policy violation explanation provided',
  },
  notify: true,
};

export const violationComment4: PolicyViolationComment = {
  objectType: 'transactions',
  txnId: 'txeqxj49dgh',
  comment: {
    comment: 'Policy violation explanation: test comment 1',
  },
  notify: true,
};

export const violationComment5: PolicyViolationComment = {
  objectType: 'transactions',
  txnId: 'txeqxj89ddf',
  comment: {
    comment: 'No policy violation explanation provided',
  },
  notify: true,
};
