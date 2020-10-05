import { Component, Input, OnInit } from '@angular/core';
import { ExtendedAdvanceRequest } from 'src/app/core/models/extended_advance_request.model';

@Component({
  selector: 'app-my-advances-card',
  templateUrl: './my-advances-card.component.html',
  styleUrls: ['./my-advances-card.component.scss'],
})
export class MyAdvancesCardComponent implements OnInit {

  @Input() advanceRequest: ExtendedAdvanceRequest;

  constructor() { }

  ngOnInit() {}

}
