import { Component, Input, OnInit } from '@angular/core'
@Component({
  selector: 'fy-bottom-sheet',
  templateUrl: './fy-bottom-sheet.component.html'
})
export class FyBottomSheetComponent implements OnInit {
  @Input() type: string;


  constructor() { }

  ngOnInit() {
  }

}