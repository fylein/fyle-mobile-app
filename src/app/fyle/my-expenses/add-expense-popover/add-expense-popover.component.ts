import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-expense-popover',
  templateUrl: './add-expense-popover.component.html',
  styleUrls: ['./add-expense-popover.component.scss'],
})
export class AddExpensePopoverComponent implements OnInit {

  @Input() isInstaFyleEnabled: boolean;
  @Input() isMileageEnabled: boolean;
  @Input() isPerDiemEnabled: boolean;

  constructor(
    private popoverController: PopoverController,
    private router: Router
  ) { }

  ngOnInit() { }

  async instafyle(event) {
    await this.popoverController.dismiss();
    this.router.navigate(['/', 'enterprise', 'camera_overlay']);
  }

  async createExpense(event) {
    await this.popoverController.dismiss();
    this.router.navigate(['/', 'enterprise', 'add_edit_expense']);
  } 

  async createMileage(event) {
    await this.popoverController.dismiss();
    this.router.navigate(['/', 'enterprise', 'add_edit_mileage']);
  }

  async createPerDiem(event) {
    await this.popoverController.dismiss();
    this.router.navigate(['/', 'enterprise', 'add_edit_per_diem']);
  }

}
