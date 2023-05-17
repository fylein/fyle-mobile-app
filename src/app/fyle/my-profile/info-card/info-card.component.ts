import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClipboardService } from 'src/app/core/services/clipboard.service';

@Component({
  selector: 'app-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss'],
})
export class InfoCardComponent {
  @Input() title: string;

  @Input() content: string;

  @Input() contentToCopy: string;

  @Output() textCopied = new EventEmitter<string>();

  constructor(private clipboardService: ClipboardService) {}

  async copyToClipboard(contentToCopy: string) {
    await this.clipboardService.writeString(contentToCopy);
    let message = 'Email Copied Successfully';
    if (this.title.includes('Message')) {
      message = 'Phone Number Copied Successfully';
    }
    this.textCopied.emit(message);
  }
}
