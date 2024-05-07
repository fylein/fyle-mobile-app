import deepFreeze from 'deep-freeze-strict';

export const allowedExpenseTypes: Record<string, boolean> = deepFreeze({
  mileage: true,
  perDiem: true,
});
