import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})

export class FilterPipe implements PipeTransform {
  /**
   * items: list of elements that needs to be filtered
   * searchText: search query
   * param (Optional): key to get the value to be filtered if items is list of objects
   *  */
  transform(items: any[], searchText: string, param: string): any[] {
    // if there are no items, return empty list
    if (!(items && items.length > 0)) {
      return [];
    }

    // if there is no search text, return full list
    if (!searchText) {
      return items; 
    }

    var searchTextLowerCase = searchText.toLowerCase();

    if (items && items.length > 0) {
      return items.filter ( item => {
        // if param is passed (in case when 'items' is list of objects), set itemValue using param. Else set item itself (when list of strings is passed)
        let itemValue = item[param] || item;
        return itemValue && item.length > 0 && itemValue.includes(searchTextLowerCase);
      });
    }
  }
}