import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})

export class FilterPipe implements PipeTransform {
	/**
	 * items: list of elements that needs to be filtered
	 * searchText: search query
	 * param: key to get the value to be filtered if items is list of objects
	 *  */
  transform(items: any[], searchText: string, param: string): any[] {
    // if there are no items, return empty list
		if (!items) {
			return [];
		}

		// if there is no search text, return full list
		if (!searchText) {
			return items; 
		}

		searchText = searchText.toLowerCase();

		if (items && items.length > 0) {
			return items.filter ( item => {
				let itemValue = item[param] || item;
				return itemValue.includes(searchText);
			});
		}
	}
}