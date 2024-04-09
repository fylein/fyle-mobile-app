import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-number',
  templateUrl: './card-number.component.html',
  styleUrls: ['./card-number.component.scss'],
})
export class CardNumberComponent {
  @Input() cardNumber: string;

  maskedDots: number[] = Array<number>(12).fill(0);
}
