import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { FyPopupComponent } from './fy-popup.component';
import { PopupConfig } from './popup.model';
import { click, getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('FyPopupComponent', () => {
  let component: FyPopupComponent;
  let fixture: ComponentFixture<FyPopupComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;

  const popupConfigData: PopupConfig = {
    header: 'Header',
    message: 'Message',
    primaryCta: {
      text: 'Primary CTA',
    },
    secondaryCta: {
      text: 'Secondary CTA',
    },
  };

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    TestBed.configureTestingModule({
      declarations: [FyPopupComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FyPopupComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    component = fixture.componentInstance;
    component.config = popupConfigData;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show CTA detail correctly', () => {
    expect(getTextContent(getElementBySelector(fixture, '.fy-popup--header-text'))).toEqual(popupConfigData.header);
    expect(getTextContent(getElementBySelector(fixture, '.fy-popup--body'))).toEqual(popupConfigData.message);
    expect(getTextContent(getElementBySelector(fixture, '.fy-popup--secondary-cta'))).toEqual(
      popupConfigData.secondaryCta.text
    );
    expect(getTextContent(getAllElementsBySelector(fixture, '.fy-popup--button')[1])).toEqual(
      popupConfigData.primaryCta.text
    );
  });

  it('primaryCtaClicked(): should perform primary CTA', () => {
    popoverController.dismiss.and.callThrough();

    component.primaryCtaClicked();
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({
      action: 'primary',
    });
  });

  it('secondaryCtaClicked(): should perform secondary CTA', () => {
    popoverController.dismiss.and.callThrough();

    component.secondaryCtaClicked();
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({
      action: 'secondary',
    });
  });

  it('cancel(): should perform cancel operation', () => {
    popoverController.dismiss.and.callThrough();

    component.cancel();
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({
      action: 'cancel',
    });
  });

  it('should perform primary CTA if clicked on', () => {
    spyOn(component, 'primaryCtaClicked');

    const primaryCTA = getAllElementsBySelector(fixture, '.fy-popup--button')[1] as HTMLElement;
    click(primaryCTA);
    expect(component.primaryCtaClicked).toHaveBeenCalledTimes(1);
  });

  it('should perform secondary CTA if clicked on', () => {
    spyOn(component, 'secondaryCtaClicked');

    const secondaryCTA = getElementBySelector(fixture, '.fy-popup--secondary-cta') as HTMLElement;
    click(secondaryCTA);
    expect(component.secondaryCtaClicked).toHaveBeenCalledTimes(1);
  });

  it('should perform cancel action if clicked on', () => {
    spyOn(component, 'cancel');

    const cancelCTA = getElementBySelector(fixture, '.fy-popup--header-cancel') as HTMLElement;
    click(cancelCTA);
    expect(component.cancel).toHaveBeenCalledTimes(1);
  });
});
