import { Component, Input, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  imports: [IonicModule, TranslocoPipe],
})
export class AddCardComponent {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() showZeroStateMessage: boolean;

  readonly addCardClick = output<Event>();
}
