import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BankAccountCardsComponent } from './bank-account-cards.component';
import { linkedAccounts } from 'src/app/core/mock-data/personal-cards.data';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import Swiper from 'swiper';
import { BankAccountCardComponent } from './bank-account-card/bank-account-card.component';

// create mock for bank-account-card component
@Component({
  selector: 'app-bank-account-card',
  template: '<div></div>',
  imports: [],
})
class MockBankAccountCardComponent {
}

describe('BankAccountCardsComponent', () => {
  let component: BankAccountCardsComponent;
  let fixture: ComponentFixture<BankAccountCardsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BankAccountCardsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).overrideComponent(BankAccountCardsComponent, {
      remove: {
        imports: [BankAccountCardComponent],
      },
      add: {
        imports: [MockBankAccountCardComponent],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      },
    }).compileComponents();

    fixture = TestBed.createComponent(BankAccountCardsComponent);
    component = fixture.componentInstance;
    component.linkedAccounts = linkedAccounts;
    component.minimal = false;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the deleted event', () => {
    spyOn(component.deleted, 'emit');
    component.onDeleted();
    fixture.detectChanges();
    expect(component.deleted.emit).toHaveBeenCalledTimes(1);
  });

  describe('onCardChange():', () => {
    it('should emit the changed event with the ID of the selected card', () => {
      spyOn(component.changed, 'emit');
      (component as any).onCardChange({ realIndex: 1 } as Swiper);
      fixture.detectChanges();
      expect(component.changed.emit).toHaveBeenCalledOnceWith(linkedAccounts[1]);
    });
  });

  it('should render bullet with correct class', () => {
    const index = 1;
    const className = 'swiper-pagination-bullet';
    const result = component.pagination.renderBullet(index, className);
    expect(result).toContain(`<span class="fyle ${className}"> </span>`);
  });
});
