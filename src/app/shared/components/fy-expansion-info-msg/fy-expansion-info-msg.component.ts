import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-fy-expansion-info-msg',
  templateUrl: './fy-expansion-info-msg.component.html',
  styleUrls: ['./fy-expansion-info-msg.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FyExpansionInfoMsgComponent {
  @Input() infoMsgContent = '';

  @Input() showHelpLink = false;

  @Input() helpLinkLabel = 'Learn more';

  @Output() helpLinkClick = new EventEmitter<void>();

  onHelpLinkClick(): void {
    this.helpLinkClick.emit();
  }
}
