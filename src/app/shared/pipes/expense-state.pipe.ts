import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({ name: 'expenseState' })
export class ExpenseState implements PipeTransform {
  private translocoService = inject(TranslocoService);

  transform(val: string): string {
    if (!val) {
      return val;
    }

    const states: Record<string, string> = {
      DRAFT: this.translocoService.translate('pipes.expenseState.incomplete'),
      COMPLETE: this.translocoService.translate('pipes.expenseState.complete'),
      APPROVER_PENDING: this.translocoService.translate('pipes.expenseState.submitted'),
      APPROVED: this.translocoService.translate('pipes.expenseState.approved'),
      PAYMENT_PENDING: this.translocoService.translate('pipes.expenseState.paymentPending'),
      PAYMENT_PROCESSING: this.translocoService.translate('pipes.expenseState.processing'),
      PAID: this.translocoService.translate('pipes.expenseState.closed'),
      UNREPORTABLE: this.translocoService.translate('pipes.expenseState.blocked'),
    };

    return states[val];
  }
}
