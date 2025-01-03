import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { CCExpenseMerchantInfoModalComponent } from './cc-expense-merchant-info-modal.component';
import { getElementBySelector } from 'src/app/core/dom-helpers';

describe('CCExpenseMerchantInfoComponent', () => {
  let component: CCExpenseMerchantInfoModalComponent;
  let modalController: jasmine.SpyObj<ModalController>;
  let fixture: ComponentFixture<CCExpenseMerchantInfoModalComponent>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [CCExpenseMerchantInfoModalComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CCExpenseMerchantInfoModalComponent);
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
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

    expect(modalController.dismiss).toHaveBeenCalled();
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
