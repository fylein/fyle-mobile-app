import { Component, inject } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-card-added',
  templateUrl: './card-added.component.html',
  styleUrls: ['./card-added.component.scss'],
  standalone: false,
})
export class CardAddedComponent {
  private popoverController = inject(PopoverController);

  closeModal(): void {
    this.popoverController.dismiss();
  }
}
