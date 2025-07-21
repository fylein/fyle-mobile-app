import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-card-added',
  templateUrl: './card-added.component.html',
  styleUrls: ['./card-added.component.scss'],
  standalone: false,
})
export class CardAddedComponent {
  constructor(private popoverController: PopoverController) {}

  closeModal(): void {
    this.popoverController.dismiss();
  }
}
