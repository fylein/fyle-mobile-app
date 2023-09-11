import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Photo } from '@capacitor/camera';
import { DocumentNormalizer } from 'capacitor-plugin-dynamsoft-document-normalizer';
import { DetectedQuadResult } from 'dynamsoft-document-normalizer';
import { Point } from 'dynamsoft-document-normalizer/dist/types/interface/point';
@Component({
  selector: 'app-crop-page',
  templateUrl: './crop-image.component.html',
  styleUrls: ['./crop-image.component.scss'],
})
export class CropImageComponent {
  points: [Point, Point, Point, Point];
  constructor(private router: Router) {}
  offset: { x: number; y: number } | undefined;
  coordinates: [number, number][] = [];
  @Input() image: Photo;
  private imgWidth: number = 0;
  private imgHeight: number = 0;
  dataURL: string = '';
  viewBox: string = '0 0 1280 720';
  detectedQuadResult: DetectedQuadResult | undefined; // Define the detectedQuadResult property
  selectedIndex: number = -1;
  usingTouchEvent: boolean = false;
  ngOnInit() {
    console.log('====================================');
    console.log(this.image);
    console.log('====================================');
    if (this.image.dataUrl) {
      const pThis = this;
      let img = new Image();
      img.onload = function () {
        if (pThis.image.dataUrl) {
          pThis.viewBox = '0 0 ' + img.naturalWidth + ' ' + img.naturalHeight;
          pThis.imgWidth = img.naturalWidth;
          pThis.imgHeight = img.naturalHeight;
          pThis.dataURL = pThis.image.dataUrl;
          pThis.detect();
        }
      };
      img.src = pThis.image.dataUrl;
    }
  }
  //The width of the SVG element is adjusted so that its ratio matches the image's ratio.
  getSVGWidth(svgElement: any) {
    let imgRatio = this.imgWidth / this.imgHeight;
    let width = svgElement.clientHeight * imgRatio;
    return width;
  }
  async detect() {
    console.log('====================================');
    console.log('START detect');
    console.log('====================================');
    let results = (await DocumentNormalizer.detect({ source: this.dataURL })).results;
    if (results.length > 0) {
      console.log('START 0');
      this.detectedQuadResult = results[0]; // Here, we only use the first detection result
      console.log('detectedQuadResult', this.detectedQuadResult);
      this.points = this.detectedQuadResult.location.points;
      console.log('detectedQuadResult', this.points);
    } else {
      console.log('START 1');
      this.presentToast(); // Make a toast if there are no documents detected
    }
  }
  // Add the presentToast function
  async presentToast() {
    console.log('====================================');
    console.log('No file detected');
    console.log('====================================');
  }
  getPointsData() {
    if (this.detectedQuadResult) {
      let location = this.detectedQuadResult.location;
      let pointsData = location.points[0].x + ',' + location.points[0].y + ' ';
      pointsData = pointsData + location.points[1].x + ',' + location.points[1].y + ' ';
      pointsData = pointsData + location.points[2].x + ',' + location.points[2].y + ' ';
      pointsData = pointsData + location.points[3].x + ',' + location.points[3].y;
      return pointsData;
    }
    return '';
  }
  getRectX(index: number, x: number) {
    return this.getOffsetX(index) + x;
  }
  getOffsetX(index: number) {
    let width = this.getRectSize();
    if (index === 0 || index === 3) {
      return -width;
    }
    return 0;
  }
  getRectY(index: number, y: number) {
    return this.getOffsetY(index) + y;
  }
  getOffsetY(index: number) {
    let height = this.getRectSize();
    if (index === 0 || index === 1) {
      return -height;
    }
    return 0;
  }
  getRectSize() {
    let percent = 640 / this.imgWidth;
    return 30 / percent; //30 works fine when the width is 640. Scale it if the image has a different width
  }
  getRectStrokeWidth(i: number) {
    let percent = 640 / this.imgWidth;
    if (i === this.selectedIndex) {
      return 5 / percent;
    } else {
      return 2 / percent;
    }
  }
  onRectMouseDown(index: number, event: any) {
    if (!this.usingTouchEvent) {
      console.log(event);
      this.selectedIndex = index;
    }
  }
  onRectMouseUp(event: any) {
    if (!this.usingTouchEvent) {
      console.log(event);
      this.selectedIndex = -1;
    }
  }
  onRectTouchStart(index: number, event: any) {
    this.usingTouchEvent = true; //Touch events are triggered before mouse events. We can use this to prevent executing mouse events.
    console.log(event);
    this.selectedIndex = index;
  }
  startDrag(event: any, svgElement: any) {
    if (this.usingTouchEvent && !event.targetTouches) {
      //if touch events are supported, do not execute mouse events.
      return;
    }
    if (this.points && this.selectedIndex != -1) {
      this.offset = this.getMousePosition(event, svgElement);
      let x = this.points[this.selectedIndex].x;
      let y = this.points[this.selectedIndex].y;
      this.offset.x -= x;
      this.offset.y -= y;
    }
  }
  //Convert the screen coordinates to the SVG's coordinates from https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
  getMousePosition(event: any, svg: any) {
    let CTM = svg.getScreenCTM();
    if (event.targetTouches) {
      //if it is a touch event
      let x = event.targetTouches[0].clientX;
      let y = event.targetTouches[0].clientY;
      return {
        x: (x - CTM.e) / CTM.a,
        y: (y - CTM.f) / CTM.d,
      };
    } else {
      return {
        x: (event.clientX - CTM.e) / CTM.a,
        y: (event.clientY - CTM.f) / CTM.d,
      };
    }
  }
  drag(event: any, svgElement: any) {
    if (this.usingTouchEvent && !event.targetTouches) {
      //if touch events are supported, do not execute mouse events.
      return;
    }
    if (this.points && this.selectedIndex != -1 && this.offset) {
      event.preventDefault();
      let coord = this.getMousePosition(event, svgElement);
      let point = this.points[this.selectedIndex];
      point.x = coord.x - this.offset.x;
      point.y = coord.y - this.offset.y;
    }
  }
}
