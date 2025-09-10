import { Component, Input, ViewEncapsulation, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-expansion-info-msg',
  templateUrl: './fy-expansion-info-msg.component.html',
  styleUrls: ['./fy-expansion-info-msg.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [IonicModule, MatIcon, TranslocoPipe],
})
export class FyExpansionInfoMsgComponent {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() infoMsgContent = '';

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() showHelpLink = false;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() helpLinkLabel: string;

  readonly helpLinkClick = output<void>();

  onHelpLinkClick(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.helpLinkClick.emit();
  }
}
