import { Component } from '@angular/core';

@Component({
  selector: 'app-view-expense-skeleton-loader',
  templateUrl: './view-expense-skeleton-loader.component.html',
  styleUrls: ['./view-expense-skeleton-loader.component.scss'],
})
export class ViewExpenseSkeletonLoaderComponent {
  rows = Array(7).fill(0);
}
