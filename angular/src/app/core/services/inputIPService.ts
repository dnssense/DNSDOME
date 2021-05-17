import { Injectable } from '@angular/core';
import { SearchSetting } from '../models/SearchSetting';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { OperationResult } from '../models/OperationResult';
import {IpWithMask} from '../models/Agent';
import {Address4, Address6} from 'ip-address';

@Injectable({ providedIn: 'root' })
export class InputIPService {



  constructor(

  ) { }

  hasOneOfChars(input: string, chars: string[]) {
    for (let ab = 0; ab < input.length; ++ab) {
      for (let ac = 0; ac < chars.length; ++ac) {
        if (input[ab] == chars[ac]) {
          return true;
        }

      }
    }
    return false;
  }

  checkIPNumber(event: KeyboardEvent|FocusEvent, inputValue: string, ipValidations?: boolean[], index?: number) {

    let isIPV4 = true;

    const specialChars = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', 'Home', 'End', 'Control', 'Shift', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Meta', 'OS'];

    const ipv4Chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'];

    const ipv6Chars = ['A', 'B', 'C', 'D', 'E', 'F', 'a', 'b', 'c', 'd', 'e', 'f', ':'];
    let allowedChars = [];
    allowedChars = allowedChars.concat(ipv6Chars).concat(ipv4Chars).concat(specialChars);
    let isValid = false;

    if (event instanceof KeyboardEvent) {
      if (event.ctrlKey || event.metaKey) {
        return null;
      }

      for (let i = 0; i < specialChars.length; i++) {
        if (specialChars[i] == event.key) {
          return null;
        }
      }

      // check keydown char
      for (let i = 0; i < allowedChars.length; i++) {
        if (allowedChars[i] == event.key) {
          isValid = true;
          break;
        }
      }
    } else {
      isValid = true;
    }

    if (isValid) {
      if (event instanceof KeyboardEvent) {
        const isSpecialChar = specialChars.find(x => x == event.key);
        if (!isSpecialChar) {
          inputValue = (inputValue ? inputValue : '') + event.key;
        }
      }
      const isipV6 = this.hasOneOfChars(inputValue, ipv6Chars);
      const isipV4 = this.hasOneOfChars(inputValue, ['.']);

      if (isipV4 && !isipV6) {// ipv4
         isIPV4 = true;
        const octets = inputValue.split(/[.]/g);
        if (octets.length && octets[octets.length - 1] == '') {
          octets.splice(octets.length - 1, 1);
        }
        if (octets.length > 4) {
          isValid = false;
        }
        if (octets.length == 4 && inputValue.endsWith('.')) {
        isValid = false;
        }
        octets.forEach(x => {
          if (x.length > 3 || x.length == 0) {
            isValid = false;
          }
          if (Number(x) < 0 || Number(x) > 255) {
            isValid = false;
          }
        });



      } else {

        isIPV4 = false;
        if (event instanceof KeyboardEvent) {
          for (let i = 0; i < ipv6Chars.length; i++) {
            if ('.' == event.key) {
              isValid = false;
              break;
            }
          }
        }
        const octets = inputValue.split(/[:]/g);

        if (octets.length > 8) {
          isValid = false;
        }

        octets.forEach(x => {
          if (x.length > 4) {
            isValid = false;
          }
        });
        const len = inputValue.length;
        if (len - 3 >= 0) {
          if (inputValue[len - 3] == ':' && inputValue[len - 2] == ':' && inputValue[len - 1] == ':') {
          isValid = false;
          }
        }


      }


    }
    // console.log(`ipv4:${isIPV4} and isValid:${isValid}`);

    if (ipValidations) {
      ipValidations[index] = isValid;
    }

    if (!isValid) {
      event.preventDefault();
      return null;
    }
    return isIPV4;

  }

  getIPDetails(ip: IpWithMask) {
    if (this.hasOneOfChars(ip.baseIp, ['.'])) {
      const addr = new Address4(ip.baseIp + '/' + ip.mask);
      return `[${addr.startAddress().address}-${addr.endAddress().address}] - ${addr.endAddress().bigInteger().subtract(addr.startAddress().bigInteger()).toString()} ip`;
    } else {
      const addr = new Address6(ip.baseIp + '/' + ip.mask);
      return `[${addr.startAddress().address}-${addr.endAddress().address}] - ${addr.endAddress().bigInteger().subtract(addr.startAddress().bigInteger()).toString()} ip`;
    }
  }

}
