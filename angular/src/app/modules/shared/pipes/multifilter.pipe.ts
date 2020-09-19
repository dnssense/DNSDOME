import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'multifilter'
})
export class MultiFilterPipe implements PipeTransform {

    findNextProperty(obj: any, properties: string[], index: number) {
        obj = obj[properties[index]];
        index++;
        if (!obj || index == properties.length) {
            return obj;
        }
        return this.findNextProperty(obj, properties, index);

    }
    transform(items: any[], searchText: string, columnNames: string): any[] {
        if (!items) { return []; }

        if (!searchText) { return items; }

        searchText = searchText.toLocaleLowerCase().trim();
        const columns: string[] = columnNames.split(',');
        return items.filter(item => {
            const foundedColumn = columns.find(abc => {
                const innerProperties = abc.split('.');
                const value = this.findNextProperty(item, innerProperties, 0);
                if (value && typeof (value) == 'string') {
                    return value.toLocaleLowerCase().includes(searchText);
                }
                return false;
            });
            if (foundedColumn) { return true; }
            return false;

        });
    }
}
