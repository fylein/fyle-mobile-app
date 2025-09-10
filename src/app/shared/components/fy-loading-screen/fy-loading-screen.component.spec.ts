import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { getAllElementsBySelector, getElementAttributeValue, getElementBySelector } from 'src/app/core/dom-helpers';

import { FyLoadingScreenComponent } from './fy-loading-screen.component';

describe('FyLoadingScreenComponent', () => {
  let component: FyLoadingScreenComponent;
  let fixture: ComponentFixture<FyLoadingScreenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), FyLoadingScreenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FyLoadingScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct number of rows', () => {
    const rows = getAllElementsBySelector(fixture, 'ion-row');
    expect(rows.length).toEqual(component.rows.length);
  });

  it('should show the checkbox column when selection mode is enabled', () => {
    component.isSelectionModeEnabled = true;
    fixture.detectChanges();
    const checkboxColumns = getAllElementsBySelector(fixture, '.loading-screen-container--checkbox');
    expect(checkboxColumns.length).toEqual(component.rows.length);
  });

  it('should hide the checkbox column when selection mode is disabled', () => {
    component.isSelectionModeEnabled = false;
    fixture.detectChanges();
    const checkboxColumns = getAllElementsBySelector(fixture, '.loading-screen-container--checkbox');
    expect(checkboxColumns.length).toEqual(0);
  });

  describe('Content block size', () => {
    it('should set column size based on isSelectionModeEnabled input is true', () => {
      component.isSelectionModeEnabled = true;
      fixture.detectChanges();
      const ionColEl = getElementBySelector(fixture, '.loading-screen-container--content-block');
      expect(getElementAttributeValue(ionColEl, 'size')).toBe('6.0');
    });

    it('should set column size based on isSelectionModeEnabled input is false', () => {
      component.isSelectionModeEnabled = false;
      fixture.detectChanges();
      const ionColEl = getElementBySelector(fixture, '.loading-screen-container--content-block');
      expect(getElementAttributeValue(ionColEl, 'size')).toBe('7.0');
    });
  });
});
