import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output, Type, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html'
})
export class BottomSheetComponent implements OnInit, AfterViewInit {
  @ViewChild('bottomSheetContents', {read: ViewContainerRef}) container: ViewContainerRef;

  @Input() componentClass: Type<any>;
  @Input() componentInputs;

  @Output() outputMessage = new EventEmitter();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.componentClass);
    const component = this.container.createComponent(componentFactory);

    if (this.componentInputs) {
      for (const key in this.componentInputs) {
        if (Object.prototype.hasOwnProperty.call(this.componentInputs, key)) {
          component.instance[key] = this.componentInputs[key];
        }
      }
    }

    if(component.instance.outputMessage) {
      component.instance.outputMessage.subscribe(res => this.outputMessage.emit(res));
    }

    this.cdr.detectChanges();
  }

  ngOnInit() { }

}
