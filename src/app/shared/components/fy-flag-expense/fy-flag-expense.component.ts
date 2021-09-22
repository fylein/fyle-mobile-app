import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-fy-flag-expense',
  templateUrl: './fy-flag-expense.component.html',
  styleUrls: ['./fy-flag-expense.component.scss'],
})
export class FyFlagExpenseComponent implements OnInit {
  @Input() isExpenseFlagged: boolean;

  title: string;

  message = '';

  constructor(
    private modalController: ModalController
  ) {}

  closeModal() {
    this.modalController.dismiss();
  }

  flagUnflag() {
    this.modalController.dismiss({ message: this.message });
  }

  ngOnInit() {
    this.title = this.isExpenseFlagged ? 'Unflag' : 'Flag';
  }
}
