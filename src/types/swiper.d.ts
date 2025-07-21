declare module 'swiper/angular' {
  import { NgModule, Component } from '@angular/core';

  export class SwiperModule extends NgModule {}
  export class SwiperComponent extends Component {
    swiperRef: Swiper;
  }
}

declare module 'swiper' {
  export default class SwiperCore {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static use(modules: any[]): void;
  }
  export class Pagination {}
  export class Autoplay {}
  export class Swiper {
    update(): void;

    slideNext(): Promise<void>;

    slidePrev(): Promise<void>;

    activeIndex: number;
  }
}
