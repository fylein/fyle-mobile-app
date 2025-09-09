import { Component, inject } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-card-added',
    templateUrl: './card-added.component.html',
    styleUrls: ['./card-added.component.scss'],
    imports: [IonicModule, TranslocoPipe],
})
export class CardAddedComponent {
  private popoverController = inject(PopoverController);

  closeModal(): void {
    this.popoverController.dismiss();
  }
}
