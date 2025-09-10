import { Component } from '@angular/core';
import { IonCol, IonGrid, IonRow, IonSkeletonText } from '@ionic/angular/standalone';


@Component({
  selector: 'app-view-expense-skeleton-loader',
  templateUrl: './view-expense-skeleton-loader.component.html',
  styleUrls: ['./view-expense-skeleton-loader.component.scss'],
  imports: [
    IonCol,
    IonGrid,
    IonRow,
    IonSkeletonText
  ],
})
export class ViewExpenseSkeletonLoaderComponent {
  rows = Array(7).fill(0); //because we need 7 rows, hence an array of length 7 to iterate over using @for()
}
