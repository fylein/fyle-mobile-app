import { ReportState } from './report-state.pipe';

describe('ReportStatePipe', () => {
  const pipe = new ReportState();

  it('transforms "" state to ""', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('transforms "DRAFT" state to "draft"', () => {
    expect(pipe.transform('DRAFT')).toBe('draft');
  });

  it('transforms "DRAFT_INQUIRY" state to "incomplete"', () => {
    expect(pipe.transform('DRAFT_INQUIRY')).toBe('incomplete');
  });

  it('transforms "COMPLETE" state to "unreported"', () => {
    expect(pipe.transform('COMPLETE')).toBe('unreported');
  });

  it('transforms "APPROVER_PENDING" state to "reported"', () => {
    expect(pipe.transform('APPROVER_PENDING')).toBe('reported');
  });

  it('transforms "APPROVER_INQUIRY" state to "inquiry"', () => {
    expect(pipe.transform('APPROVER_INQUIRY')).toBe('sent_back');
  });

  it('transforms "POLICY_INQUIRY" state to "auto_flagged"', () => {
    expect(pipe.transform('POLICY_INQUIRY')).toBe('auto_flagged');
  });

  it('transforms "REJECTED" state to "rejected"', () => {
    expect(pipe.transform('REJECTED')).toBe('rejected');
  });

  it('transforms "APPROVED" state to "approved"', () => {
    expect(pipe.transform('APPROVED')).toBe('approved');
  });

  it('transforms "PAID" state to "paid"', () => {
    expect(pipe.transform('PAID')).toBe('paid');
  });

  it('transforms "PAYMENT_PENDING" state to "payment_pending"', () => {
    expect(pipe.transform('PAYMENT_PENDING')).toBe('payment_pending');
  });

  it('transforms "PAYMENT_PROCESSING" state to "payment_processing"', () => {
    expect(pipe.transform('PAYMENT_PROCESSING')).toBe('payment_processing');
  });

  it('transforms "CANCELLED" state to "cancelled"', () => {
    expect(pipe.transform('CANCELLED')).toBe('cancelled');
  });

  it('transforms "APPROVAL_PENDING" state to "reported"', () => {
    expect(pipe.transform('APPROVAL_PENDING')).toBe('reported');
  });

  it('transforms "APPROVAL_DONE" state to "approved"', () => {
    expect(pipe.transform('APPROVAL_DONE')).toBe('approved');
  });

  it('transforms "APPROVAL_DISABLED" state to "disabled"', () => {
    expect(pipe.transform('APPROVAL_DISABLED')).toBe('disabled');
  });

  it('transforms "APPROVAL_REJECTED" state to "rejected"', () => {
    expect(pipe.transform('APPROVAL_REJECTED')).toBe('rejected');
  });
});
