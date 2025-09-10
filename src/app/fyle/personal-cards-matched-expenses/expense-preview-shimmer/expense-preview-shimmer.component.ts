import { Component, OnInit } from '@angular/core';
import { IonCol, IonGrid, IonRow, IonSkeletonText } from '@ionic/angular/standalone';


@Component({
  selector: 'app-expense-preview-shimmer',
  templateUrl: './expense-preview-shimmer.component.html',
  styleUrls: ['./expense-preview-shimmer.component.scss'],
  imports: [
    IonCol,
    IonGrid,
    IonRow,
    IonSkeletonText
  ],
})
export class ExpensePreviewShimmerComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
