import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-add-corporate-card',
  templateUrl: './add-corporate-card.component.html',
  styleUrls: ['./add-corporate-card.component.scss'],
})
export class AddCorporateCardComponent {
  constructor(private popoverController: PopoverController) {}

  closePopover(): void {
    this.popoverController.dismiss();
  }
}
