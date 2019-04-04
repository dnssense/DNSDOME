import { Pipe, PipeTransform, Injectable } from '@angular/core';

declare var moment: any;

@Pipe({
  name: 'dateFormat'
})
@Injectable()
export class DateFormatPipe implements PipeTransform {
  transform(value: any, args: Array<any>): string {
    let utc = moment.utc(value).toDate();
    return moment(utc).format('YYYY.MM.DD HH:mm:ss');
  }
}
