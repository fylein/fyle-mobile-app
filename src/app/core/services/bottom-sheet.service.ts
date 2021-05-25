import { ComponentFactoryResolver, Inject, Injectable } from '@angular/core';
import { FyBottomSheetComponent } from '../../shared/components/fy-bottom-sheet/fy-bottom-sheet.component'

@Injectable({
  providedIn: 'root'
})
export class BottomSheetService {
  factoryResolver: any;
  rootViewContainer: any;

  constructor(@Inject(ComponentFactoryResolver) factoryResolver) {
    this.factoryResolver = factoryResolver
  }
  setRootViewContainerRef(viewContainerRef) {
    this.rootViewContainer = viewContainerRef
  }
  addFyBottomSheetComponent() {
    const factory = this.factoryResolver
                        .resolveComponentFactory(FyBottomSheetComponent)
    const component = factory
      .create(this.rootViewContainer.parentInjector)
    this.rootViewContainer.insert(component.hostView)
  }


}