import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ClipboardService } from 'src/app/core/services/clipboard.service';

interface ListItems {
  icon: string;
  text: string;
  textToCopy?: string;
}

@Component({
  selector: 'app-popup-with-bullets',
  templateUrl: './popup-with-bullets.component.html',
  styleUrls: ['./popup-with-bullets.component.scss'],
})
export class PopupWithBulletsComponent implements OnInit {
  @Input() title: string;

  @Input() listHeader: string;

  @Input() listItems: ListItems[];

  @Input() ctaText: string;

  constructor(private popoverController: PopoverController, private clipboardService: ClipboardService) {}

  ngOnInit() {}

  dimissPopover() {
    this.popoverController.dismiss();
  }

  async copyToClipboard(textToCopy: string) {
    this.clipboardService.writeString(textToCopy);
    //TODO: Add a toast message once design is ready
  }
}
