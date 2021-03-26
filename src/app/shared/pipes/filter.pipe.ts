import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})

export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    // if there are no items, return empty list
		if (!items) {
			return [];
		}

		// if there is no search text, return full list
		if (!searchText) {
			return items; 
		}

		searchText = searchText.toLowerCase();

		console.log('items: ', items);
		return items.filter ( item => {
      return item.toLowerCase().includes(searchText);
    });
   }
}