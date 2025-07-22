import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({
  name: 'mileageRateName',
  standalone: true,
})
export class MileageRateName implements PipeTransform {
  constructor(private translocoService: TranslocoService) {}

  transform(value: string): string {
    if (!value) {
      return '';
    }

    const names: Record<string, string> = {
      two_wheeler: this.translocoService.translate('pipes.mileageRateName.twoWheeler'),
      four_wheeler: this.translocoService.translate('pipes.mileageRateName.fourWheelerType1'),
      four_wheeler1: this.translocoService.translate('pipes.mileageRateName.fourWheelerType2'),
      four_wheeler3: this.translocoService.translate('pipes.mileageRateName.fourWheelerType3'),
      four_wheeler4: this.translocoService.translate('pipes.mileageRateName.fourWheelerType4'),
      bicycle: this.translocoService.translate('pipes.mileageRateName.bicycle'),
      electric_car: this.translocoService.translate('pipes.mileageRateName.electricCar'),
    };

    return names[value] || value;
  }
}
