export const expenseRouteData = [
  {
    category: 'Food',
    state: 'DRAFT',
    route: ['/', 'enterprise', 'add_edit_expense'],
  },
  {
    category: 'Mileage',
    state: 'COMPLETE',
    route: ['/', 'enterprise', 'add_edit_mileage'],
  },
  {
    category: 'Per Diem',
    state: 'APPROVER_PENDING',
    route: ['/', 'enterprise', 'add_edit_per_diem'],
  },
  {
    category: 'Software',
    state: 'APPROVED',
    route: ['/', 'enterprise', 'view_expense'],
  },
  {
    category: 'Mileage',
    state: 'PAYMENT_PENDING',
    route: ['/', 'enterprise', 'view_mileage'],
  },
  {
    category: 'Per Diem',
    state: 'PAID',
    route: ['/', 'enterprise', 'view_per_diem'],
  },
  {
    state: 'DRAFT',
    route: ['/', 'enterprise', 'add_edit_expense'],
  },
];
