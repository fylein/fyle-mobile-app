import { AdvanceState } from "./advance-state.pipe";

fdescribe('AdvanceStatePipe', () => {
  const pipe = new AdvanceState();

  it('transforms "DRAFT" state to "draft"', () => {
    expect(pipe.transform('DRAFT')).toBe('draft');
  });

  it('transforms "SUBMITTED" state to "pending"', () => {
    expect(pipe.transform('SUBMITTED')).toBe('pending');
  });

  it('transforms "APPROVED" state to "approved"', () => {
    expect(pipe.transform('APPROVED')).toBe('approved');
  });

  it('transforms "INQUIRY" state to "inquiry"', () => {
    expect(pipe.transform('INQUIRY')).toBe('inquiry');
  });

  it('transforms "PAID" state to "issued"', () => {
    expect(pipe.transform('PAID')).toBe('issued');
  });

  it('transforms "APPROVAL_PENDING" state to "pending"', () => {
    expect(pipe.transform('APPROVAL_PENDING')).toBe('pending');
  });

  it('transforms "APPROVAL_DISABLED" state to "disabled"', () => {
    expect(pipe.transform('APPROVAL_DISABLED')).toBe('disabled');
  });

  it('transforms "APPROVAL_REJECTED" state to "rejected"', () => {
    expect(pipe.transform('APPROVAL_REJECTED')).toBe('rejected');
  });

  it('transforms "REJECTED" state to "rejected"', () => {
    expect(pipe.transform('REJECTED')).toBe('rejected');
  });
});
