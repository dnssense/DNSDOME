import { Pipe, PipeTransform, Injectable } from '@angular/core';

declare var moment: any;

@Pipe({
  name: 'dateFormat'
})
@Injectable()
export class DateFormatPipe implements PipeTransform {
  transform(value: any, args: Array<any>): string {
    const utc = moment.utc(value).toDate();
    // burasi degisirse fillSearchSettingsByFilters bu fonksiyon icindeki yere bak
    return moment(utc).format('YYYY-MM-DD HH:mm:ss');
  }
}
