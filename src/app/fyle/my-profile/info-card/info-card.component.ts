import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ClipboardService } from 'src/app/core/services/clipboard.service';

@Component({
  selector: 'app-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss'],
  standalone: false,
})
export class InfoCardComponent {
  private clipboardService = inject(ClipboardService);

  @Input() title: string;

  @Input() content: string;

  @Input() contentToCopy: string;

  @Input() toastMessageContent: string;

  @Output() copiedText = new EventEmitter<string>();

  async copyToClipboard(contentToCopy: string) {
    await this.clipboardService.writeString(contentToCopy);
    this.copiedText.emit(this.toastMessageContent);
  }
}
