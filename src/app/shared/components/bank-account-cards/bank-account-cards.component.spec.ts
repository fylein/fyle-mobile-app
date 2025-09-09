import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { SwiperModule } from 'swiper/angular';
import { BankAccountCardsComponent } from './bank-account-cards.component';
import { linkedAccounts } from 'src/app/core/mock-data/personal-cards.data';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import Swiper from 'swiper';

describe('BankAccountCardsComponent', () => {
  let component: BankAccountCardsComponent;
  let fixture: ComponentFixture<BankAccountCardsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), SwiperModule, BankAccountCardsComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
      component.onCardChange([{ realIndex: 1 }] as Partial<Swiper[]>);
      fixture.detectChanges();
      expect(component.changed.emit).toHaveBeenCalledOnceWith(linkedAccounts[1]);
    });
  });

  it('should set pagination to dynamic bullets', () => {
    const index = 1;
    const className = 'bank-accounts--swiper';
    const result = component.pagination.renderBullet(index, className);
    fixture.detectChanges();
    expect(result).toContain(`<span class="fyle ${className}"> </span>`);
  });
});
