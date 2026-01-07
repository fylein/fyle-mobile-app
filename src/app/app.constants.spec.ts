import { MyHammerConfig, MIN_SCREEN_WIDTH } from './app.constants';

describe('AppConstants', () => {
  describe('MyHammerConfig', () => {
    it('should have overrides with pinch and rotate disabled', () => {
      const config = new MyHammerConfig();
      expect(config.overrides).toEqual({
        pinch: { enable: false },
        rotate: { enable: false },
      });
    });
  });

  describe('MIN_SCREEN_WIDTH', () => {
    it('should be defined', () => {
      expect(MIN_SCREEN_WIDTH).toBeTruthy();
    });
  });
});
