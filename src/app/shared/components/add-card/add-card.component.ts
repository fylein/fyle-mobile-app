import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  standalone: false,
})
export class AddCardComponent {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() showZeroStateMessage: boolean;

  @Output() addCardClick: EventEmitter<Event> = new EventEmitter<Event>();
}
