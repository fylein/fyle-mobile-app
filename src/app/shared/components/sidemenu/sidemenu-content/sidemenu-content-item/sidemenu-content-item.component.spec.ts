import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterModule } from '@angular/router';
import { SidemenuContentItemComponent } from './sidemenu-content-item.component';
import { sidemenuItemData1, sidemenuItemData2 } from 'src/app/core/mock-data/sidemenu-item.data';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('SidemenuContentItemComponent', () => {
  let sidemenuContentItemComponent: SidemenuContentItemComponent;
  let fixture: ComponentFixture<SidemenuContentItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ RouterModule, RouterTestingModule, SidemenuContentItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidemenuContentItemComponent);
    sidemenuContentItemComponent = fixture.componentInstance;
    sidemenuContentItemComponent.sidemenuItem = sidemenuItemData1;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(sidemenuContentItemComponent).toBeTruthy();
  });

  it('should set isRoute to false if dropdownOptions is empty and openLiveChat is not present', () => {
    sidemenuContentItemComponent.sidemenuItem = sidemenuItemData1;
    fixture.detectChanges();
    sidemenuContentItemComponent.ngOnInit();
    expect(sidemenuContentItemComponent.isRoute).toBeFalse();
  });

  it('should set dropdownHeight to 0 if dropdownOptions is empty', () => {
    sidemenuContentItemComponent.sidemenuItem = sidemenuItemData1;
    fixture.detectChanges();
    sidemenuContentItemComponent.ngOnInit();
    expect(sidemenuContentItemComponent.dropdownHeight).toBe(0);
  });

  it('should set appropriate dropdown height is dropdownOptions are present', () => {
    sidemenuContentItemComponent.sidemenuItem = sidemenuItemData2;
    fixture.detectChanges();
    sidemenuContentItemComponent.ngOnInit();
    expect(sidemenuContentItemComponent.dropdownHeight).toBe(100);
  });

  it('should have the correct title displayed', fakeAsync(() => {
    sidemenuContentItemComponent.sidemenuItem = sidemenuItemData1;
    sidemenuContentItemComponent.ngOnInit();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const labelElement = getElementBySelector(fixture, '.sidemenu-item__label-container__label');
    expect(getTextContent(labelElement)).toEqual(sidemenuContentItemComponent.sidemenuItem.title);
  }));

  it('goToRoute(): should emit redirect event', () => {
    const sidemenuItem = sidemenuItemData2;
    const contentItemSpy = spyOn(sidemenuContentItemComponent.redirect, 'emit');
    fixture.detectChanges();
    sidemenuContentItemComponent.goToRoute(sidemenuItem);
    expect(contentItemSpy).toHaveBeenCalledOnceWith(sidemenuItem);
  });
});
