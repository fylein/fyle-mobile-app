import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';

import { CardAddedComponent } from './card-added.component';
import { getElementBySelector } from 'src/app/core/dom-helpers';

describe('CardAddedComponent', () => {
  let component: CardAddedComponent;
  let fixture: ComponentFixture<CardAddedComponent>;

  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [CardAddedComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardAddedComponent);
    component = fixture.componentInstance;

    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the popover when clicked on the got it button', () => {
    const gotItButton = getElementBySelector(fixture, '[data-testid="got-it-button"]') as HTMLButtonElement;
    gotItButton.click();

    fixture.detectChanges();

    expect(popoverController.dismiss).toHaveBeenCalled();
  });
});
