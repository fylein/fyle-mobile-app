import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({
  name: 'expenseState',
  standalone: false,
})
export class ExpenseState implements PipeTransform {
  constructor(private translocoService: TranslocoService) {}

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
    };

    return states[val];
  }
}
