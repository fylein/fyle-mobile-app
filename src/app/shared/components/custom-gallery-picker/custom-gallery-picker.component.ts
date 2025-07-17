import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { from, Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { TranslocoService } from '@jsverse/transloco';
import { TrackingService } from 'src/app/core/services/tracking.service';

interface GalleryImage {
  id: string;
  base64: string;
  selected: boolean;
  timestamp: number;
}

@Component({
  selector: 'app-custom-gallery-picker',
  templateUrl: './custom-gallery-picker.component.html',
  styleUrls: ['./custom-gallery-picker.component.scss'],
})
export class CustomGalleryPickerComponent implements OnInit, OnDestroy {
  @ViewChild('imageContainer') imageContainer: ElementRef;

  images: GalleryImage[] = [];
  selectedImages: GalleryImage[] = [];
  loading = true;
  maxImages = 10;
  
  private backButtonSubscription: Subscription;

  constructor(
    private modalController: ModalController,
    private imagePicker: ImagePicker,
    private platform: Platform,
    private translocoService: TranslocoService,
    private trackingService: TrackingService
  ) {}

  ngOnInit(): void {
    this.loadGalleryImages();
    this.setupBackButton();
  }

  ngOnDestroy(): void {
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }

  private setupBackButton(): void {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () => {
      this.cancel();
    });
  }

  private async loadGalleryImages(): Promise<void> {
    try {
      const hasPermission = await this.imagePicker.hasReadPermission();
      
      if (!hasPermission) {
        await this.imagePicker.requestReadPermission();
        this.loadGalleryImages();
        return;
      }

      const options = {
        maximumImagesCount: 50, // Load more images to show in gallery
        outputType: 1,
        quality: 70,
      };

      from(this.imagePicker.getPictures(options))
        .pipe(
          filter((imageBase64Strings: string[]) => Array.isArray(imageBase64Strings)),
          switchMap((imageBase64Strings: string[]) => {
            this.images = imageBase64Strings.map((base64, index) => ({
              id: `img_${Date.now()}_${index}`,
              base64: 'data:image/jpeg;base64,' + base64,
              selected: false,
              timestamp: Date.now() - (index * 1000), // Simulate recent order
            }));
            this.loading = false;
            return [];
          })
        )
        .subscribe();
    } catch (error) {
      console.error('Error loading gallery images:', error);
      this.loading = false;
    }
  }

  toggleImageSelection(image: GalleryImage): void {
    if (image.selected) {
      // Deselect image
      image.selected = false;
      this.selectedImages = this.selectedImages.filter(img => img.id !== image.id);
    } else {
      // Select image if under limit
      if (this.selectedImages.length < this.maxImages) {
        image.selected = true;
        this.selectedImages.push(image);
      }
    }
  }

  openFileExplorer(): void {
    // Trigger file input for additional file types
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,application/pdf';
    fileInput.multiple = true;
    
    fileInput.onchange = (event: any) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        this.handleFileSelection(files);
      }
    };
    
    fileInput.click();
  }

  private handleFileSelection(files: FileList): void {
    Array.from(files).forEach((file, index) => {
      if (this.selectedImages.length < this.maxImages) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const newImage: GalleryImage = {
            id: `file_${Date.now()}_${index}`,
            base64: e.target.result,
            selected: true,
            timestamp: Date.now(),
          };
          this.selectedImages.push(newImage);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  uploadSelectedImages(): void {
    if (this.selectedImages.length === 0) {
      return;
    }

    this.trackingService.instafyleGalleryUploadOpened({});
    
    const base64ImagesWithSource = this.selectedImages.map(img => ({
      source: 'MOBILE_DASHCAM_GALLERY',
      base64Image: img.base64,
    }));

    this.modalController.dismiss({
      base64ImagesWithSource,
    });
  }

  cancel(): void {
    this.modalController.dismiss();
  }

  get selectedCount(): number {
    return this.selectedImages.length;
  }

  get canSelectMore(): boolean {
    return this.selectedImages.length < this.maxImages;
  }

  trackByImageId(index: number, image: GalleryImage): string {
    return image.id;
  }
} 