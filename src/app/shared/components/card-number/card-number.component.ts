import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-card-number',
  templateUrl: './card-number.component.html',
  styleUrls: ['./card-number.component.scss'],
  standalone: false,
})
export class CardNumberComponent {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() cardNumber: string;

  readonly cardNickname = input<string>(undefined);

  maskedAsterisks: number[] = Array<number>(12).fill(0);
}
