import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-popup-alert-component',
  templateUrl: './popup-alert-component.component.html',
  styleUrls: ['./popup-alert-component.component.scss'],
})
export class PopupAlertComponentComponent implements OnInit {

  constructor(
    private popoverController: PopoverController
  ) { }

  @Input() title: string;
  @Input() message: string;
  @Input() primaryCta: { text: string; action: string; type?: string }
  @Input() secondaryCta: { text: string; action: string; type?: string }

  ngOnInit() {}

  ctaClickedEvent(action) {
    this.popoverController.dismiss({
      action
    });
  }
}
