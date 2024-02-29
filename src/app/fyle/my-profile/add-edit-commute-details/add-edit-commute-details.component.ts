import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-add-edit-commute-details',
  templateUrl: './add-edit-commute-details.component.html',
  styleUrls: ['./add-edit-commute-details.component.scss'],
})
export class AddEditCommuteDetailsComponent implements OnInit {
  home_location: FormControl;

  work_location: FormControl;

  constructor() {}

  ngOnInit() {}
}
