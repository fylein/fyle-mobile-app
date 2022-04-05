import { ExpenseState } from './expense-state.pipe';

fdescribe('ExpenseStatePipe', () => {
  const pipe = new ExpenseState();

  it('transforms "" state to ""', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('transforms "DRAFT" state to "incomplete"', () => {
    expect(pipe.transform('DRAFT')).toBe('incomplete');
  });

  it('transforms "COMPLETE" state to "fyled"', () => {
    expect(pipe.transform('COMPLETE')).toBe('fyled');
  });

  it('transforms "APPROVER_PENDING" state to "reported"', () => {
    expect(pipe.transform('APPROVER_PENDING')).toBe('reported');
  });

  it('transforms "APPROVED" state to "approved"', () => {
    expect(pipe.transform('APPROVED')).toBe('approved');
  });

  it('transforms "PAYMENT_PENDING" state to "payment_pending"', () => {
    expect(pipe.transform('PAYMENT_PENDING')).toBe('payment_pending');
  });

  it('transforms "PAYMENT_PROCESSING" state to "payment_processing"', () => {
    expect(pipe.transform('PAYMENT_PROCESSING')).toBe('payment_processing');
  });

  it('transforms "PAID" state to "paid"', () => {
    expect(pipe.transform('PAID')).toBe('paid');
  });
});
