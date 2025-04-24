import deepFreeze from 'deep-freeze-strict';

import { ExpenseComment } from '../models/expense-comment.model';

export const expenseCommentData: ExpenseComment = deepFreeze({
  action: 'COMMENTED',
  action_data: null,
  comment: 'comment add',
  created_at: '2025-04-17T05:39:54.872279+00:00',
  creator_type: 'USER',
  creator_user: {
    email: 'devendra.r@fyle.in',
    full_name: 'Devendra Rana G',
    id: 'usvMoPfCC9Xw',
  },
  creator_user_id: 'usvMoPfCC9Xw',
  expense_id: 'txjt6agn0gBY',
  id: 'stNj1KHeiNIb',
  org_id: 'orNbIQloYtfa',
  updated_at: '2025-04-17T05:39:54.872279+00:00',
});

export const expenseCommentData2: ExpenseComment = deepFreeze({
  action: 'DATA_EXTRACTED',
  action_data: {
    Amount: 5.72,
    Category: 'Office Supplies',
    Merchant: 'Enroll',
  },
  comment: 'System has auto-filled expense field(s)',
  created_at: '2025-04-11T07:50:42.167591+00:00',
  creator_type: 'SYSTEM',
  creator_user: null,
  creator_user_id: null,
  expense_id: 'txjt6agn0gBY',
  id: 'stIdwUZhp7xB',
  org_id: 'orNbIQloYtfa',
  updated_at: '2025-04-11T07:50:42.167594+00:00',
});
