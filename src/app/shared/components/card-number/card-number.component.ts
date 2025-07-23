import { Component, Input } from '@angular/core';
import { NgClass, SlicePipe } from '@angular/common';

@Component({
    selector: 'app-card-number',
    templateUrl: './card-number.component.html',
    styleUrls: ['./card-number.component.scss'],
    imports: [NgClass, SlicePipe],
})
export class CardNumberComponent {
  @Input() cardNumber: string;

  @Input() cardNickname: string;

  maskedAsterisks: number[] = Array<number>(12).fill(0);
}
