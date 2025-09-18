import { Component, inject } from '@angular/core';
import { IonIcon, PopoverController } from '@ionic/angular/standalone';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-card-added',
  templateUrl: './card-added.component.html',
  styleUrls: ['./card-added.component.scss'],
  imports: [
    IonIcon,
    TranslocoPipe
  ],
})
export class CardAddedComponent {
  private popoverController = inject(PopoverController);

  closeModal(): void {
    this.popoverController.dismiss();
  }
}
