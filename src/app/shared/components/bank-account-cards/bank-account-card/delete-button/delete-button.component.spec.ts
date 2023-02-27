import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
import { click, getElementBySelector } from 'src/app/core/dom-helpers';

import { DeleteButtonComponent } from './delete-button-component';

describe('DeleteButtonComponent', () => {
  let component: DeleteButtonComponent;
  let fixture: ComponentFixture<DeleteButtonComponent>;
  let popoverController: PopoverController;

  beforeEach(async () => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    await TestBed.configureTestingModule({
      declarations: [DeleteButtonComponent],
      imports: [IonicModule.forRoot()],
      providers: [{ provide: PopoverController, useValue: popoverControllerSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteButtonComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call popoverController.dismiss when confirmDelete button is clicked', () => {
    const deleteButton = getElementBySelector(fixture, '.delete-button') as HTMLElement;
    click(deleteButton);
    component.confirmDelete();
    expect(popoverController.dismiss).toHaveBeenCalledWith('delete');
  });
});
