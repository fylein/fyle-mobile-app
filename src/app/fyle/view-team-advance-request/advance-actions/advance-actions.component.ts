import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-advance-actions',
  templateUrl: './advance-actions.component.html',
  styleUrls: ['./advance-actions.component.scss'],
  standalone: false,
})
export class AdvanceActionsComponent implements OnInit {
  @Input() actions;

  @Input() areq;

  constructor(private popoverController: PopoverController) {}

  ngOnInit() {}

  openAnotherPopover(command: string) {
    this.popoverController.dismiss({
      command,
    });
  }
}
