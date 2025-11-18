import { Component, OnInit, Input, inject, input } from '@angular/core';
import { PopoverController } from '@ionic/angular/standalone';
import { MatRipple } from '@angular/material/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-advance-actions',
  templateUrl: './advance-actions.component.html',
  styleUrls: ['./advance-actions.component.scss'],
  imports: [MatRipple, TranslocoPipe],
})
export class AdvanceActionsComponent implements OnInit {
  private popoverController = inject(PopoverController);

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() actions;

  readonly areq = input(undefined);

  ngOnInit() {}

  openAnotherPopover(command: string) {
    this.popoverController.dismiss({
      command,
    });
  }
}
