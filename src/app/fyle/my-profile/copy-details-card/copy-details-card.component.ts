import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-copy-details-card',
  templateUrl: './copy-details-card.component.html',
  styleUrls: ['./copy-details-card.component.scss'],
})
export class CopyDetailsCardComponent {
  @Input() title: string;

  @Input() content: string;

  @Input() contentToCopy: string;

  constructor() {}

  async copyToClipboard(contentToCopy: string) {
    await navigator.clipboard.writeText(contentToCopy);
  }
}
