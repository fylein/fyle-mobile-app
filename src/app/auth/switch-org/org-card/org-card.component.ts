import { Component, OnInit, Input, output } from '@angular/core';
import { Org } from 'src/app/core/models/org.model';

@Component({
  selector: 'app-org-card',
  templateUrl: './org-card.component.html',
  styleUrls: ['./org-card.component.scss'],
  standalone: false,
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
