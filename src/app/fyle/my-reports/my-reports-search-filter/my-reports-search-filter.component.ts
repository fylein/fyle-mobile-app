import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-my-reports-search-filter',
  templateUrl: './my-reports-search-filter.component.html',
  styleUrls: ['./my-reports-search-filter.component.scss'],
})
export class MyReportsSearchFilterComponent implements OnInit {

  @Input() filters = [];
  fg: FormGroup;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.fg = this.fb.group({
      state: [],
      date: []
    });

    this.fg.valueChanges.subscribe(console.log);
  }

}
