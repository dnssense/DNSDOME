import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'MacAddressFormatterPipe'
})
@Injectable()
export class MacAddressFormatterPipe implements PipeTransform {

  transform(mac: any): any {
    if (mac) {
      return mac.match(/.{1,2}/g).join(':');
    }
    return null;
  }

}
