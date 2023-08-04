import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-add-corporate-card',
  templateUrl: './add-corporate-card.component.html',
  styleUrls: ['./add-corporate-card.component.scss'],
})
export class AddCorporateCardComponent implements OnInit {
  showTnc: boolean;

  constructor(private popoverController: PopoverController) {}

  ngOnInit(): void {
    this.showTnc = false;
  }

  closePopover(): void {
    this.popoverController.dismiss();
  }

  toggleTnc(): void {
    this.showTnc = !this.showTnc;
  }
}
