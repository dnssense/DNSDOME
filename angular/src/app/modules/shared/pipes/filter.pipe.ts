import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], searchText: string, columnName: string): any[] {
        if (!items) { return []; }

        if (!searchText) { return items; }

        searchText = searchText.toLowerCase().trim();
        const columnnames = columnName.split('.');
        function deepProperty(x: any, columnnames: string[]) {
            if (!columnnames || !columnnames.length) return x;
            return deepProperty(x[columnnames[0]], columnnames.slice(1));
        }

        return items.filter(it => {
            return deepProperty(it, columnnames).toLowerCase().includes(searchText);
        });
    }
}
