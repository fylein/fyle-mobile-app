import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({
  name: 'advanceState',
})
export class AdvanceState implements PipeTransform {
  constructor(private translocoService: TranslocoService) {}

  transform(value: string): string {
    if (!value) {
      return value;
    }

    const states: Record<string, string> = {
      DRAFT: this.translocoService.translate('pipes.advanceState.draft'),
      SUBMITTED: this.translocoService.translate('pipes.advanceState.pending'),
      APPROVED: this.translocoService.translate('pipes.advanceState.approved'),
      INQUIRY: this.translocoService.translate('pipes.advanceState.sentBack'),
      PAID: this.translocoService.translate('pipes.advanceState.issued'),
      APPROVAL_PENDING: this.translocoService.translate('pipes.advanceState.pending'),
      APPROVAL_DONE: this.translocoService.translate('pipes.advanceState.approved'),
      APPROVAL_DISABLED: this.translocoService.translate('pipes.advanceState.disabled'),
      APPROVAL_REJECTED: this.translocoService.translate('pipes.advanceState.rejected'),
      REJECTED: this.translocoService.translate('pipes.advanceState.rejected'),
    };

    return states[value];
  }
}
