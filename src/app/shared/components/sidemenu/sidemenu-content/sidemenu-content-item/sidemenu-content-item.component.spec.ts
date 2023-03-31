import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterModule } from '@angular/router';
import { SidemenuContentItemComponent } from './sidemenu-content-item.component';
import { dropdownOptionsRes } from 'src/app/core/mock-data/dropdown-options.data';
import { sidemenuItemData1, sidemenuItemData2 } from 'src/app/core/mock-data/sidemenu-item.data';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

xdescribe('SidemenuContentItemComponent', () => {
  let sidemenuContentItemComponent: SidemenuContentItemComponent;
  let fixture: ComponentFixture<SidemenuContentItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SidemenuContentItemComponent],
      imports: [IonicModule.forRoot(), RouterModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SidemenuContentItemComponent);
    sidemenuContentItemComponent = fixture.componentInstance;
    sidemenuContentItemComponent.sidemenuItem = dropdownOptionsRes[0];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(sidemenuContentItemComponent).toBeTruthy();
  });

  it('should set isRoute to true if dropdownOptions is empty and openLiveChat is not present', () => {
    sidemenuContentItemComponent.sidemenuItem = sidemenuItemData2;
    sidemenuContentItemComponent.ngOnInit();
    expect(sidemenuContentItemComponent.isRoute).toBeTrue();
  });

  it('should set dropdownHeight to 0 if dropdownOptions is empty', () => {
    sidemenuContentItemComponent.sidemenuItem = sidemenuItemData1;
    sidemenuContentItemComponent.ngOnInit();
    expect(sidemenuContentItemComponent.dropdownHeight).toBe(0);
  });

  it('should emit redirect event when goToRoute is called', () => {
    const sidemenuItem = sidemenuItemData1;
    spyOn(sidemenuContentItemComponent.redirect, 'emit');
    sidemenuContentItemComponent.goToRoute(sidemenuItem);
    expect(sidemenuContentItemComponent.redirect.emit).toHaveBeenCalledWith(sidemenuItem);
  });

  it('should have the correct title displayed', () => {
    sidemenuContentItemComponent.sidemenuItem = sidemenuItemData1;
    fixture.detectChanges();
    const labelElement = getElementBySelector(fixture, '.sidemenu-item__label-container__label');
    expect(getTextContent(labelElement)).toEqual(sidemenuContentItemComponent.sidemenuItem.title);
  });
});
