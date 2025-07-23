import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { MatRipple } from '@angular/material/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-advance-actions',
    templateUrl: './advance-actions.component.html',
    styleUrls: ['./advance-actions.component.scss'],
    imports: [MatRipple, TranslocoPipe],
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
