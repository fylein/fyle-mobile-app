import { Component, inject } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-delete-button',
    templateUrl: './delete-button-component.html',
    styleUrls: ['./delete-button-component.scss'],
    imports: [IonicModule],
})
export class DeleteButtonComponent {
  private popoverController = inject(PopoverController);

  confirmDelete() {
    this.popoverController.dismiss('delete');
  }
}
