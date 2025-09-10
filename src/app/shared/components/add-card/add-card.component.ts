import { Component, Input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { IonIcon } from '@ionic/angular/standalone';


@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  imports: [
    IonIcon,
    TranslocoPipe
  ],
})
export class AddCardComponent {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() showZeroStateMessage: boolean;

  readonly addCardClick = output<Event>();
}
