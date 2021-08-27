import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Observable, from } from 'rxjs';
import { FileService } from 'src/app/core/services/file.service';
import { switchMap, tap, concatMap, map, reduce } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-fy-preview-attachments',
  templateUrl: './fy-preview-attachments.component.html',
  styleUrls: ['./fy-preview-attachments.component.scss']
})
export class FyPreviewAttachmentsComponent implements OnInit {
  @Input() txnId: string;

  @ViewChild('slides') imageSlides: any;

  sliderOptions: any;

  attachments$: Observable<any[]>;

  activeIndex = 0;

  zoomScale: number;

  constructor(private fileService: FileService, private sanitizer: DomSanitizer) {}

  getReceiptExtension(name) {
    let res = null;

    if (name) {
      const filename = name.toLowerCase();
      const idx = filename.lastIndexOf('.');

      if (idx > -1) {
        res = filename.substring(idx + 1, filename.length);
      }
    }

    return res;
  }

  getReceiptDetails(file) {
    const ext = this.getReceiptExtension(file.name);
    const res = {
      type: 'unknown',
      thumbnail: 'img/fy-receipt.svg'
    };

    if (ext && ['pdf'].indexOf(ext) > -1) {
      res.type = 'pdf';
      res.thumbnail = 'img/fy-pdf.svg';
    } else if (ext && ['png', 'jpg', 'jpeg', 'gif'].indexOf(ext) > -1) {
      res.type = 'image';
      res.thumbnail = file.url;
    }

    return res;
  }

  zoomIn() {
    this.zoomScale += 0.25;
  }

  zoomOut() {
    this.zoomScale -= 0.25;
  }

  resetZoom() {
    this.zoomScale = 0.5;
  }

  ngOnInit() {
    this.zoomScale = 0.5;
    this.sliderOptions = {
      zoom: {
        maxRatio: 1
      }
    };

    this.attachments$ = this.fileService.findByTransactionId(this.txnId).pipe(
      switchMap((fileObjs) => from(fileObjs)),
      concatMap((fileObj: any) =>
        this.fileService.downloadUrl(fileObj.id).pipe(
          map((downloadUrl) => {
            fileObj.url = downloadUrl;
            this.sanitizer.bypassSecurityTrustUrl(fileObj.url);
            const details = this.getReceiptDetails(fileObj);
            fileObj.type = details.type;
            fileObj.thumbnail = details.thumbnail;
            return fileObj;
          })
        )
      ),
      reduce((acc, curr) => acc.concat(curr), [])
    );
  }

  goToNextSlide() {
    this.imageSlides.slideNext();
  }

  goToPrevSlide() {
    this.imageSlides.slidePrev();
  }
}
