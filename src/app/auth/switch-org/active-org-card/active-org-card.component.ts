import { Component, OnInit, Input } from '@angular/core';
import { Org } from 'src/app/core/models/org.model';

@Component({
  selector: 'app-active-org-card',
  templateUrl: './active-org-card.component.html',
  styleUrls: ['./active-org-card.component.scss'],
})
export class ActiveOrgCardComponent implements OnInit {
  @Input() org: Org;

  @Input() isPrimaryOrg: boolean;

  @Input() isLoading = false;

  constructor() {}

  ngOnInit(): void {}
}
