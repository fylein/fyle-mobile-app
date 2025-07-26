import { Component } from '@angular/core';

@Component({
  selector: 'app-view-expense-skeleton-loader',
  templateUrl: './view-expense-skeleton-loader.component.html',
  styleUrls: ['./view-expense-skeleton-loader.component.scss'],
  standalone: false,
})
export class ViewExpenseSkeletonLoaderComponent {
  rows = Array(7).fill(0); //because we need 7 rows, hence an array of length 7 to iterate over using @for()
}
