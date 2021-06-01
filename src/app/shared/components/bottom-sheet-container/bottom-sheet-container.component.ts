import { AfterViewInit, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { BottomSheetService } from 'src/app/core/services/bottom-sheet.service';


@Component({
  selector: 'app-bottom-sheet-container',
  templateUrl: './bottom-sheet-container.component.html'
})
export class BottomSheetContainerComponent implements OnInit, AfterViewInit {
  @ViewChild('bottomSheetContainer', {read: ViewContainerRef}) container: ViewContainerRef;

  constructor(
    private bottomSheetService: BottomSheetService
  ) { }

  ngAfterViewInit(): void {
    this.bottomSheetService.initialize(this.container)
  }

  ngOnInit() {

  }

}
