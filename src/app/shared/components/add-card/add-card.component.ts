import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  standalone: true,
  imports: [IonicModule, TranslocoPipe],
})
export class AddCardComponent {
  @Input() showZeroStateMessage: boolean;

  @Output() addCardClick: EventEmitter<Event> = new EventEmitter<Event>();
}
