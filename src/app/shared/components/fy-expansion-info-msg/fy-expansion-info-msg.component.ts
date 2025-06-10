import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-fy-expansion-info-msg',
  templateUrl: './fy-expansion-info-msg.component.html',
  styleUrls: ['./fy-expansion-info-msg.component.scss'],
})
export class FyExpansionInfoMsgComponent {
  @Input() infomsgcontent = '';

  @Input() showhelplink = false;

  @Input() helplinklabel = 'Learn more';

  @Output() helpLinkClick = new EventEmitter<void>();

  onHelpLinkClick(): void {
    this.helpLinkClick.emit();
  }
}
