import { ComponentFactoryResolver, Injectable, Type, ViewContainerRef } from '@angular/core';
import { BottomSheetComponent } from 'src/app/shared/components/bottom-sheet/bottom-sheet.component';

@Injectable({
  providedIn: 'root'
})
export class BottomSheetService {
  container: ViewContainerRef;
  components = [];

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }


  addBottomSheetComponent(config: {componentClass, componentInputs}) {
    const componentRef = this.addComponent(BottomSheetComponent)
    componentRef.instance.componentClass = config.componentClass;
    componentRef.instance.componentInputs = config.componentInputs;
    return componentRef.instance.outputMessage;
  }

  removeBottomSheetComponent(option?) {
    this.container.clear();
  }

  private addComponent(componentClass: Type<any>) {
    // Create component dynamically inside the ng-template
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
    const component = this.container.createComponent(componentFactory);

    // Push the component so that we can keep track of which components are created
    this.components.push(component);

    return component;
  }

  initialize(container: ViewContainerRef) {
    this.container = container;
  }

}
