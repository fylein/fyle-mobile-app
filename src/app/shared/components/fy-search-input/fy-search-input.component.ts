import { Component, OnInit, Input, Output } from '@angular/core';
import { EventEmitter } from 'events';

@Component({
  selector: 'app-fy-search-input',
  templateUrl: './fy-search-input.component.html',
  styleUrls: ['./fy-search-input.component.scss'],
})
export class FySearchInputComponent implements OnInit {

  @Input() searchText: string;
  @Input() isLoading: boolean;
  // @Input() submessage: string;
  // @Input() link: string;

  
  @Output() searchInputKeyUp = new EventEmitter();
  // @Output() searchInputKeyUp: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  clearSearchValue () {
    console.log('inside clear search text');
    this.searchText = '';
  }

  onSearchInputKeyUp (event) {
    console.log('inside keyup!: ', event);
    this.searchInputKeyUp.emit(event);
  }

  ngOnInit() {
    console.log('inside init');
  }

}