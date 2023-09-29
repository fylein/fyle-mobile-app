export const allowedExpenseTypes: Record<string, boolean> = {
  mileage: true,
  perDiem: true,
};

export const allowedExpenseTypesMileage: Record<string, boolean> = {
  mileage: true,
  perDiem: false,
};

export const allowedExpenseTypesPerDiem: Record<string, boolean> = {
  mileage: false,
  perDiem: true,
};
