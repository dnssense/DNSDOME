import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], searchText: string, columnName: string): any[] {
        if (!items) return [];

        if (!searchText) return items;

        searchText = searchText.toLowerCase().trim();

        return items.filter(it => {
            return it[columnName].toLowerCase().includes(searchText);
        });
    }
}