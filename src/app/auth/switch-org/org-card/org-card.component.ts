import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Org } from 'src/app/core/models/org.model';

@Component({
  selector: 'app-org-card',
  templateUrl: './org-card.component.html',
  styleUrls: ['./org-card.component.scss'],
})
export class OrgCardComponent implements OnInit {
  @Input() org: Org;

  @Input() isPrimaryOrg: boolean;

  @Input() isLoading = false;

  @Output() selectOrg = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  onClick() {
    this.selectOrg.emit();
  }
}
