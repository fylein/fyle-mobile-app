import { Component, ComponentFactoryResolver, Inject, Injectable, OnInit, ViewChild, ViewContainerRef } from '@angular/core'
import { BottomSheetService } from '../../../core/services/bottom-sheet.service'

@Component({
  selector: 'fy-parent',
  templateUrl: './fy-parent.component.html'
})

@Injectable({
  providedIn: 'root'
})

export class FyParentComponent implements OnInit {
  name = 'from Angular';

  @ViewChild('dynamic', { 
    read: ViewContainerRef 
  }) viewContainerRef: ViewContainerRef

  constructor(
    private bottomSheetService: BottomSheetService
  ) { }

  ngOnInit() {
    this.bottomSheetService.setRootViewContainerRef(this.viewContainerRef)
    this.bottomSheetService.addFyBottomSheetComponent()
  }


}