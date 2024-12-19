import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';

import { CCExpenseMerchantInfoPopoverComponent } from './cc-expense-merchant-info-popover.component';
import { getElementBySelector } from 'src/app/core/dom-helpers';

describe('CCExpenseMerchantInfoComponent', () => {
  let component: CCExpenseMerchantInfoPopoverComponent;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let fixture: ComponentFixture<CCExpenseMerchantInfoPopoverComponent>;

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [CCExpenseMerchantInfoPopoverComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CCExpenseMerchantInfoPopoverComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the popover when clicked on close button', () => {
    const closeBtn = getElementBySelector(fixture, '[data-testid="close-btn"') as HTMLButtonElement;
    closeBtn.click();

    fixture.detectChanges();

    expect(popoverController.dismiss).toHaveBeenCalled();
  });

  describe('template', () => {
    it('should display the correct title', () => {
      fixture.detectChanges();
      const title = getElementBySelector(fixture, '[data-testid="title"');
      expect(title.textContent).toEqual('Merchant');
    });

    it('should display the correct content', () => {
      fixture.detectChanges();
      const content = getElementBySelector(fixture, '[data-testid="content"');
      expect(content.textContent).toEqual('This merchant name comes from the transaction.');
    });
  });
});
