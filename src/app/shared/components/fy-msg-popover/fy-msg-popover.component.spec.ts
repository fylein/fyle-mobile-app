import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular/standalone';
import { FyMsgPopoverComponent } from './fy-msg-popover.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('FyMsgPopoverComponent', () => {
  let component: FyMsgPopoverComponent;
  let fixture: ComponentFixture<FyMsgPopoverComponent>;
  let popoverControllerSpy: jasmine.SpyObj<PopoverController>;

  beforeEach(waitForAsync(() => {
    popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);

    TestBed.configureTestingModule({
      imports: [FyMsgPopoverComponent,
        MatIconTestingModule],
      providers: [{ provide: PopoverController, useValue: popoverControllerSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FyMsgPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set message input', () => {
    fixture.componentRef.setInput('msg', 'No category is available for the selected project.');
    fixture.detectChanges();
    expect(component.msg()).toBe('No category is available for the selected project.');
  });

  it('should call popoverController.dismiss() when dismiss() is called', () => {
    component.dismiss();
    expect(popoverControllerSpy.dismiss).toHaveBeenCalled();
  });
});
