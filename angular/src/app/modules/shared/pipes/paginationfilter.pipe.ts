import { Pipe, PipeTransform } from '@angular/core';
interface Pagination {
  currentPage: number;
  pageSize: number;
}
@Pipe({
    name: 'paginationfilter'
})
export class PaginationFilterPipe implements PipeTransform {
    transform(items: any[], pagination?: Pagination): any[] {
          const startIndex = pagination.pageSize * (pagination.currentPage - 1);
          let endIndex = pagination.pageSize * (pagination.currentPage);
          let filteredItems = items;
          if (items.length < endIndex)
            endIndex = items.length;
          if (items.length >= startIndex)
             filteredItems = items.slice(startIndex, endIndex);
          return filteredItems;
    }
}
