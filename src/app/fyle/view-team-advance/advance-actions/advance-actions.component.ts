import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ApproveAdvanceComponent } from '../approve-advance/approve-advance.component';

@Component({
  selector: 'app-advance-actions',
  templateUrl: './advance-actions.component.html',
  styleUrls: ['./advance-actions.component.scss'],
})
export class AdvanceActionsComponent implements OnInit {
  @Input() actions;

  @Input() areq;

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {}

  openAnotherPopover(command) {
    this.popoverController.dismiss({
      command,
    });
  }
}
