import { ComponentFactoryResolver, Inject, Injectable } from '@angular/core';

@Injectable()
export class BottomSheetService {
  componentFactoryResolver: any;
  alertHost: any;
  testVal: any;

  constructor(
    
  ) { }


  addBottomSheetComponent(config: {componentClass, componentInputs}) {
    const alertCmpFactory = this.componentFactoryResolver.resolveComponentFactory(config.componentClass);
    const hostViewContainerRef = this.alertHost.viewContainerRef;
    hostViewContainerRef.clear();

    const componentRef = hostViewContainerRef.createComponent(alertCmpFactory);
    // componentRef.instance.message = message;
    componentRef.instance.outputMessage.subscribe(res => {
      if(componentRef) {
        this.testVal = res;
      }
      hostViewContainerRef.clear();
    });
  }
}
