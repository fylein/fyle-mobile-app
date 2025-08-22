import { Component, Input, EventEmitter, Output, OnInit, inject, input } from '@angular/core';
import { HeaderState } from './header-state.enum';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-header',
  templateUrl: './fy-header.component.html',
  styleUrls: ['./fy-header.component.scss'],
  standalone: false,
})
export class FyHeaderComponent implements OnInit {
  private translocoService = inject(TranslocoService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() currentState: HeaderState;

  readonly navigateBack = input(false);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() title: string;

  readonly isHiddenBorder = input(false);

  @Output() simpleSearchCancel = new EventEmitter();

  @Output() multiselectBack = new EventEmitter();

  get HeaderState(): typeof HeaderState {
    return HeaderState;
  }

  ngOnInit(): void {
    this.title = this.title || this.translocoService.translate('fyHeader.fyle');
  }

  onSimpleSearchCancel(): void {
    this.simpleSearchCancel.emit();
  }

  onMultiselectBack(): void {
    this.multiselectBack.emit();
  }
}
