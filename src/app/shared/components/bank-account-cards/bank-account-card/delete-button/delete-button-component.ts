import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-delete-button',
  templateUrl: './delete-button-component.html',
  styleUrls: ['./delete-button-component.scss'],
})
export class DeleteButtonComponent {
  constructor(private popoverController: PopoverController) {}

  confirmDelete() {
    this.popoverController.dismiss('delete');
  }
}
