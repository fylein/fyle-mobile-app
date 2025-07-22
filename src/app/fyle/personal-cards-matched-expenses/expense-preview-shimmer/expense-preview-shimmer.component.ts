import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-expense-preview-shimmer',
  templateUrl: './expense-preview-shimmer.component.html',
  styleUrls: ['./expense-preview-shimmer.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class ExpensePreviewShimmerComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
