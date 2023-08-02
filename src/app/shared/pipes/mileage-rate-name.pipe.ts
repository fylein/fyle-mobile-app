import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mileageRateName',
})
export class MileageRateName implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    const names: Record<string, string> = {
      two_wheeler: 'Two Wheeler',
      four_wheeler: 'Four Wheeler - Type 1',
      four_wheeler1: 'Four Wheeler - Type 2',
      four_wheeler3: 'Four Wheeler - Type 3',
      four_wheeler4: 'Four Wheeler - Type 4',
      bicycle: 'Bicycle',
      electric_car: 'Electric Car',
    };

    return names[value] || value;
  }
}
