import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { FyInputPopoverComponent } from './fy-input-popover.component';

describe('FyInputPopoverComponent', () => {
  let component: FyInputPopoverComponent;
  let fixture: ComponentFixture<FyInputPopoverComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(async () => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FormsModule],
      declarations: [FyInputPopoverComponent],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    fixture = TestBed.createComponent(FyInputPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closePopover(): should close popover', fakeAsync(() => {
    popoverController.dismiss.and.returnValue(Promise.resolve(true));

    tick();
    component.closePopover();
    expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
  }));

  it('saveValue(): should save input value', fakeAsync(() => {
    popoverController.dismiss.and.returnValue(Promise.resolve(true));
    component.inputValue = 'input';
    fixture.detectChanges();

    tick();
    component.saveValue();
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ newValue: component.inputValue });
  }));

  it('should display title', () => {
    component.title = 'Title';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.input-popover--toolbar__title'))).toEqual('Title');
  });

  it('should display CTA text and save value when clicked', () => {
    spyOn(component, 'saveValue').and.callThrough();
    component.ctaText = 'CTA text';
    component.isRequired = true;
    component.inputValue = 'value';
    fixture.detectChanges();

    const ctaButton = getElementBySelector(fixture, '.input-popover--toolbar__btn') as HTMLElement;
    expect(getTextContent(ctaButton)).toEqual('CTA text');
    click(ctaButton);
    expect(component.saveValue).toHaveBeenCalledTimes(1);
  });

  it('should display input label and mandatory symbol', () => {
    component.inputLabel = 'Label';
    component.isRequired = true;
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.input-popover--input-container__label'))).toEqual('Label  *');
    expect(getTextContent(getElementBySelector(fixture, '.input-popover--input-container__mandatory'))).toEqual('*');
  });
});
