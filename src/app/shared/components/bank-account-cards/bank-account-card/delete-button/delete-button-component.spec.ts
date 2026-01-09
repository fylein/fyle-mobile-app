import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular/standalone';
import { DeleteButtonComponent } from './delete-button-component';

describe('DeleteButtonComponent', () => {
  let component: DeleteButtonComponent;
  let fixture: ComponentFixture<DeleteButtonComponent>;
  let popoverControllerSpy: jasmine.SpyObj<PopoverController>;

  beforeEach(async () => {
    popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);

    await TestBed.configureTestingModule({
      imports: [DeleteButtonComponent],
      providers: [{ provide: PopoverController, useValue: popoverControllerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('confirmDelete():', () => {
    it('should dismiss popover with delete action', () => {
      component.confirmDelete();
      expect(popoverControllerSpy.dismiss).toHaveBeenCalledOnceWith('delete');
    });
  });
});
