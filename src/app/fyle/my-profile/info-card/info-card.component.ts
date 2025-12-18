import { Component, Input, inject, input, output } from '@angular/core';
import { ClipboardService } from 'src/app/core/services/clipboard.service';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss'],
  imports: [IonIcon, TranslocoPipe],
})
export class InfoCardComponent {
  private clipboardService = inject(ClipboardService);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() title: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() content: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() contentToCopy: string;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() toastMessageContent: string;

  readonly showEmail = input<boolean>(false);

  readonly showBetaTag = input<boolean>(false);

  readonly copiedText = output<string>();

  async copyToClipboard(contentToCopy: string) {
    await this.clipboardService.writeString(contentToCopy);
    this.copiedText.emit(this.toastMessageContent);
  }
}
