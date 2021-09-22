import { Component, Input, OnInit } from '@angular/core';
import { PersonalCard } from 'src/app/core/models/personal_card.model';

@Component({
  selector: 'app-bank-account-card',
  templateUrl: './bank-account-card.component.html',
  styleUrls: ['./bank-account-card.component.scss'],
})
export class BankAccountCardComponent implements OnInit {
  @Input() accountDetails: PersonalCard[];

  constructor() {}

  ngOnInit(): void {}
}
