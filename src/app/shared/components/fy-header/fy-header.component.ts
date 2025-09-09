import { Component, Input, OnInit, inject, input, output } from '@angular/core';
import { HeaderState } from './header-state.enum';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';
import { NgClass } from '@angular/common';
import { FyMenuIconComponent } from '../fy-menu-icon/fy-menu-icon.component';

@Component({
    selector: 'app-fy-header',
    templateUrl: './fy-header.component.html',
    styleUrls: ['./fy-header.component.scss'],
    imports: [
        IonicModule,
        NgClass,
        FyMenuIconComponent,
        TranslocoPipe,
    ],
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

  readonly simpleSearchCancel = output();

  readonly multiselectBack = output();

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
