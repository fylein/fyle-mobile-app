import { Component, Input, EventEmitter, Output } from '@angular/core';
import { HeaderState } from './header-state.enum';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-header',
  templateUrl: './fy-header.component.html',
  styleUrls: ['./fy-header.component.scss'],
})
export class FyHeaderComponent {
  @Input() currentState: HeaderState;

  @Input() navigateBack = false;

  @Input() title: string;

  @Input() isHiddenBorder = false;

  @Output() simpleSearchCancel = new EventEmitter();

  @Output() multiselectBack = new EventEmitter();

  constructor(private translocoService: TranslocoService) {
    this.title = this.title || this.translocoService.translate('fyHeader.fyle');
  }

  get HeaderState(): typeof HeaderState {
    return HeaderState;
  }

  onSimpleSearchCancel(): void {
    this.simpleSearchCancel.emit();
  }

  onMultiselectBack(): void {
    this.multiselectBack.emit();
  }
}
