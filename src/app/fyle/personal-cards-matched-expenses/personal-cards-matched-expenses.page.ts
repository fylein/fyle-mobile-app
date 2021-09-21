import { Component, OnInit } from '@angular/core';
import { HeaderState } from '../../shared/components/fy-header/header-state.enum';

@Component({
  selector: 'app-personal-cards-matched-expenses',
  templateUrl: './personal-cards-matched-expenses.page.html',
  styleUrls: ['./personal-cards-matched-expenses.page.scss'],
})
export class PersonalCardsMatchedExpensesPage implements OnInit {

  headerState: HeaderState = HeaderState.base;

  navigateBack = true;

  constructor() { }

  ngOnInit() {
  }

}
