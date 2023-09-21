import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
})
export class AddCardComponent {
  @Input() showZeroStateMessage: boolean;

  @Output() addCardClick: EventEmitter<Event> = new EventEmitter<Event>();
}
