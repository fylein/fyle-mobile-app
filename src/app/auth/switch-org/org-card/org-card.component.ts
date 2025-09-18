import { Component, OnInit, Input, output } from '@angular/core';
import { Org } from 'src/app/core/models/org.model';
import { MatRipple } from '@angular/material/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { IonCol, IonGrid, IonRow, IonSkeletonText } from '@ionic/angular/standalone';


@Component({
  selector: 'app-org-card',
  templateUrl: './org-card.component.html',
  styleUrls: ['./org-card.component.scss'],
  imports: [
    IonCol,
    IonGrid,
    IonRow,
    IonSkeletonText,
    MatRipple,
    TranslocoPipe
  ],
})
export class OrgCardComponent implements OnInit {
  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() org: Org;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isPrimaryOrg: boolean;

  // TODO: Skipped for migration because:
  //  Your application code writes to the input. This prevents migration.
  @Input() isLoading = false;

  readonly selectOrg = output();

  constructor() {}

  ngOnInit(): void {}

  onSelectOrg() {
    this.selectOrg.emit();
  }
}
