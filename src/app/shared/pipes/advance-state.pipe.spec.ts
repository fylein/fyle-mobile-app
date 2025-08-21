import { TestBed } from '@angular/core/testing';
import { AdvanceState } from './advance-state.pipe';
import { TranslocoService } from '@jsverse/transloco';

describe('AdvanceStatePipe', () => {
  let pipe: AdvanceState;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    TestBed.configureTestingModule({
      providers: [{ provide: TranslocoService, useValue: translocoServiceSpy }],
    });

    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    pipe = TestBed.runInInjectionContext(() => new AdvanceState());

    // Mock translate method to return expected strings
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'pipes.advanceState.draft': 'draft',
        'pipes.advanceState.pending': 'pending',
        'pipes.advanceState.approved': 'approved',
        'pipes.advanceState.sentBack': 'sent back',
        'pipes.advanceState.issued': 'issued',
        'pipes.advanceState.disabled': 'disabled',
        'pipes.advanceState.rejected': 'rejected',
      };
      return translations[key] || key;
    });
  });

  it('transforms "" state to ""', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('transforms "DRAFT" state to "draft"', () => {
    expect(pipe.transform('DRAFT')).toBe('draft');
  });

  it('transforms "SUBMITTED" state to "pending"', () => {
    expect(pipe.transform('SUBMITTED')).toBe('pending');
  });

  it('transforms "APPROVED" state to "approved"', () => {
    expect(pipe.transform('APPROVED')).toBe('approved');
  });

  it('transforms "INQUIRY" state to "sent back"', () => {
    expect(pipe.transform('INQUIRY')).toBe('sent back');
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
