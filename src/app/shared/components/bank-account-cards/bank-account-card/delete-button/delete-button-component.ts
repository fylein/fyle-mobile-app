import { Component, inject } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-delete-button',
  templateUrl: './delete-button-component.html',
  styleUrls: ['./delete-button-component.scss'],
  standalone: false,
})
export class DeleteButtonComponent {
  private popoverController = inject(PopoverController);

  confirmDelete() {
    this.popoverController.dismiss('delete');
  }
}
