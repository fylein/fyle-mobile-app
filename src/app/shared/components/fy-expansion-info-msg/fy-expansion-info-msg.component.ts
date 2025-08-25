import { Component, Input, ViewEncapsulation, output } from '@angular/core';

@Component({
  selector: 'app-fy-expansion-info-msg',
  templateUrl: './fy-expansion-info-msg.component.html',
  styleUrls: ['./fy-expansion-info-msg.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
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
