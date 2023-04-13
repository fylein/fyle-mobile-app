import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { cardDetailRes } from 'src/app/core/mock-data/card-detail-data';
import { SpentCardsComponent } from './spent-cards.component';
import { SwiperModule } from 'swiper/angular';
import { getAllElementsBySelector, getElementBySelector } from 'src/app/core/dom-helpers';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SpentCardsComponent', () => {
  let component: SpentCardsComponent;
  let fixture: ComponentFixture<SpentCardsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SpentCardsComponent],
      imports: [IonicModule.forRoot(), SwiperModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SpentCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render cards in swiper component', () => {
    component.spentCards = cardDetailRes;
    fixture.detectChanges();
    const swiper = getElementBySelector(fixture, 'swiper');
    expect(swiper).toBeTruthy();
    const swiperSlides = getAllElementsBySelector(fixture, '.swiper-slide');
    expect(swiperSlides.length).toBe(3);
  });

  it('should set pagination to dynamic bullets', () => {
    const index = 1;
    const className = 'swiper-pagination-bullet';
    const result = component.pagination.renderBullet(index, className);
    expect(result).toContain(`<span class="spent-cards ${className}"> </span>`);
    expect(component.pagination.dynamicBullets).toBeTrue();
  });

  it('should render single card if only one card is present', () => {
    component.spentCards = [cardDetailRes[0]];
    fixture.detectChanges();
    const swiper = getElementBySelector(fixture, 'swiper');
    expect(swiper).toBeTruthy();
    const cardDetail = getElementBySelector(fixture, '.spent-card app-card-detail');
    expect(cardDetail).toBeTruthy();
    const swiperSlides = getAllElementsBySelector(fixture, '.swiper-slide');
    expect(swiperSlides.length).toBe(1);
  });
});
