import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-save-popover',
  templateUrl: './save-popover.component.html',
  styleUrls: ['./save-popover.component.scss'],
})
export class SavePopoverComponent implements OnInit {
  @Input() saveMode;

  @Input() otherRequests;

  constructor(private popoverController: PopoverController) {}

  close() {
    this.popoverController.dismiss();
  }

  saveAsDraft() {
    this.popoverController.dismiss({ continue: true });
  }

  ngOnInit() {}
}
