import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-fy-expansion-info-msg',
  templateUrl: './fy-expansion-info-msg.component.html',
  styleUrls: ['./fy-expansion-info-msg.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [IonicModule, MatIcon, TranslocoPipe],
})
export class FyExpansionInfoMsgComponent {
  @Input() infoMsgContent = '';

  @Input() showHelpLink = false;

  @Input() helpLinkLabel: string;

  @Output() helpLinkClick = new EventEmitter<void>();

  onHelpLinkClick(): void {
    this.helpLinkClick.emit();
  }
}
