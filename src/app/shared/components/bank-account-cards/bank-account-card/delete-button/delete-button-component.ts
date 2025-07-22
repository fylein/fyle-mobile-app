import { Component } from '@angular/core';
import { PopoverController, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-delete-button',
  templateUrl: './delete-button-component.html',
  styleUrls: ['./delete-button-component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class DeleteButtonComponent {
  constructor(private popoverController: PopoverController) {}

  confirmDelete() {
    this.popoverController.dismiss('delete');
  }
}
