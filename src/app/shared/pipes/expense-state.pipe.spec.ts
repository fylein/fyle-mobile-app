import { TranslocoService } from '@jsverse/transloco';
import { ExpenseState } from './expense-state.pipe';

describe('ExpenseStatePipe', () => {
  let pipe: ExpenseState;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(() => {
    translocoService = jasmine.createSpyObj('TranslocoService', ['translate']);

    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'pipes.expenseState.incomplete': 'incomplete',
        'pipes.expenseState.complete': 'complete',
        'pipes.expenseState.submitted': 'submitted',
        'pipes.expenseState.approved': 'approved',
        'pipes.expenseState.paymentPending': 'payment_pending',
        'pipes.expenseState.processing': 'processing',
        'pipes.expenseState.closed': 'closed',
      };
      return translations[key] || key;
    });

    pipe = new ExpenseState(translocoService);
  });

  it('transforms "" state to ""', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('transforms "DRAFT" state to "incomplete"', () => {
    expect(pipe.transform('DRAFT')).toBe('incomplete');
  });

  it('transforms "COMPLETE" state to "complete"', () => {
    expect(pipe.transform('COMPLETE')).toBe('complete');
  });

  it('transforms "APPROVER_PENDING" state to "submitted"', () => {
    expect(pipe.transform('APPROVER_PENDING')).toBe('submitted');
  });

  it('transforms "APPROVED" state to "approved"', () => {
    expect(pipe.transform('APPROVED')).toBe('approved');
  });

  it('transforms "PAYMENT_PENDING" state to "payment_pending"', () => {
    expect(pipe.transform('PAYMENT_PENDING')).toBe('payment_pending');
  });

  it('transforms "PAYMENT_PROCESSING" state to "processing"', () => {
    expect(pipe.transform('PAYMENT_PROCESSING')).toBe('processing');
  });

  it('transforms "PAID" state to "closed"', () => {
    expect(pipe.transform('PAID')).toBe('closed');
  });
});
