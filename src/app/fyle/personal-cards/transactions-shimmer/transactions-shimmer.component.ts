import { Component, OnInit } from '@angular/core';
import { IonSkeletonText } from '@ionic/angular/standalone';


@Component({
  selector: 'app-transactions-shimmer',
  templateUrl: './transactions-shimmer.component.html',
  styleUrls: ['./transactions-shimmer.component.scss'],
  imports: [
    IonSkeletonText
  ],
})
export class TransactionsShimmerComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
