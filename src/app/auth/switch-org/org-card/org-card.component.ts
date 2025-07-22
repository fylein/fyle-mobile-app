import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Org } from 'src/app/core/models/org.model';
import { IonicModule } from '@ionic/angular';
import { MatRipple } from '@angular/material/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-org-card',
  templateUrl: './org-card.component.html',
  styleUrls: ['./org-card.component.scss'],
  standalone: true,
  imports: [IonicModule, MatRipple, TranslocoPipe],
})
export class OrgCardComponent implements OnInit {
  @Input() org: Org;

  @Input() isPrimaryOrg: boolean;

  @Input() isLoading = false;

  @Output() selectOrg = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  onSelectOrg() {
    this.selectOrg.emit();
  }
}
