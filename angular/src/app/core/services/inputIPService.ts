import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import { SearchSetting } from '../models/SearchSetting';
import { Observable } from 'rxjs/Rx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from './config.service';
import { OperationResult } from '../models/OperationResult';

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

  checkIPNumber(event: KeyboardEvent, inputValue: string) {


    let isIPV4 = true;

    const specialChars = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'];

    const ipv4Chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'];

    const ipv6Chars = ['A', 'B', 'C', 'D', 'E', 'F', 'a', 'b', 'c', 'd', 'e', 'f', ':'];
    let allowedChars = [];
    allowedChars = allowedChars.concat(ipv6Chars).concat(ipv4Chars).concat(specialChars);
    let isValid = false;

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

    if (isValid) {
      const isSpecialChar = specialChars.find(x => x == event.key);
      if (!isSpecialChar) {
        inputValue = (inputValue ? inputValue : '') + event.key;
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
        for (let i = 0; i < ipv6Chars.length; i++) {
          if ('.' == event.key) {
            isValid = false;
            break;
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

    if (!isValid) {
      event.preventDefault();
      return null;
    }
    return isIPV4;

  }



}
