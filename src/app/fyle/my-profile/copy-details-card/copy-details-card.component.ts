import { Component, Input } from '@angular/core';
import { ClipboardService } from 'src/app/core/services/clipboard.service';

@Component({
  selector: 'app-copy-details-card',
  templateUrl: './copy-details-card.component.html',
  styleUrls: ['./copy-details-card.component.scss'],
})
export class CopyDetailsCardComponent {
  @Input() title: string;

  @Input() content: string;

  @Input() contentToCopy: string;

  constructor(private clipboardService: ClipboardService) {}

  async copyToClipboard(contentToCopy: string) {
    await this.clipboardService.writeString(contentToCopy);
  }
}
