import { Injectable } from '@angular/core';
import { FormControl, UntypedFormGroup } from '@angular/forms';
import { Ip } from '../models/Ip';
import * as validator from 'validator';
import * as tldjs from 'tldjs';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }


  static ipv4v6Pattern = '((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))';

  /* static checkIp(ips: Ip[], key: string): any {
    return (group: FormGroup) => {
      let object = group.controls[key];
      //ip list is empty
      if (ips == null || ips.length == 0) {
        return object.setErrors({ required: true });
      } else {
        for (let ip of ips) {
          for (var i = 0; i <= ips.length; i++) {
            //ip bos olamaz
            if (ip[i] == '') {
              return object.setErrors({ required: true });
            }
          }
          let ipInterval = '';
          if (ips.length <= 4 || ip[4] == '') {
            ipInterval = '0';
          } else {
            ipInterval = ip[4];
          }
          let ipstr = ip[0] + '.' + ip[1] + '.' + ip[2] + '.' + ip[3];
          let isValid = (ipstr != '255.255.255.255' &&
            ipstr.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/) &&
            (+ip[3] < +ipInterval || +ipInterval == 0));
          if (!isValid) {
            // ip valid degil
            return object.setErrors({ invalidIp: true });
          }
        }
      }
    }
  } */

  /*  static isValidIpString(ipString: string): any {
 
     const ips = ipString.split('.');
     if (ips == null || ips.length == 0) {
       return false;
     } else {
       for (let i = 0; i <= ips.length; i++) {
         // ip bos olamaz
         if (ips[i] == '') {
           return false;
         }
       }
 
       let ipInterval = '';
       if (ips.length <= 4 || ips[4] == '') {
         ipInterval = '0';
       } else {
         ipInterval = ips[4];
       }
       const ipstr = ips[0] + '.' + ips[1] + '.' + ips[2] + '.' + ips[3];
       const isValid = (ipstr != '255.255.255.255' &&
         ipstr.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/) &&
         (+ips[3] < +ipInterval || +ipInterval == 0));
       if (!isValid) {
         // ip valid degil
         return false;
       }
 
       return true;
     }
 
   } */


  static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    const config = {
      'required': 'Required',
      'unsolicitedMailAddress': 'Please enter a reliable e-mail address.',
      'emailAddress': 'Invalid email address',
      'invalidPhoneNumber': 'Invalid phone number',
      'mismatchedPasswords': 'Passwords does not match. Please control and type again.',
      'mismatchedEmails': 'Emails does not match. Please control and type again.',
      'invalidPassword': 'Invalid password. Password must be at least 8 characters long ,contain a number and one capital letter.',
      'minlength': `Minimum length ${validatorValue.requiredLength}`,
      'invalidIp': 'Invalid Ip Address or Ip Range',
      'invalidCaptcha': 'Check to prove you are not a bot',
      'invalidDomain': 'Invalid domain',
    };

    return config[validatorName];
  }

  static emailValidator(control) {
    // RFC 2822 compliant regex
    if (control == null || control.value == null || control.value === '') {
      return null;
    } else if (!control.value.match(/^((?!yopmail.com|boximail.com|eelmail.com|maildrop.cc|mailnesia.com|mintemail.com|mt2015.com|mt2014.com|thankyou2010.com|trash2009.com|mt2009.com|trashymail.com|mytrashmail.com|dispostable.com|trbvn.com|mailinator.com).)*$/)) {
      return { 'unsolicitedMailAddress': true };
    } else if (validator.isEmail(control.value)) {
      return null;
    } else {
      return { 'emailAddress': true };
    }
  }

  static domainValidation(control) {
    if (control == null || control.value == null || control.value === '') {
      return null;
    }
    let domain = control.value;
    if (domain) {
      domain = domain.trim();
      if (String(domain).charAt(domain.length - 1).toLowerCase() === String(domain).charAt(domain.length - 1).toUpperCase()) {
        return { 'invalidDomain': true };
      }

      const domObject = tldjs.parse(domain);
      const result = (domObject.isValid && domObject.tldExists);
      if (!result) {
        return { 'invalidDomain': true };
      }
      return result;
    }
    return { 'invalidDomain': true };

  }

  static isDomainValid(control: string) {
    if (control == null || control === '') {
      return false;
    }
    let domain = control;
    if (domain) {
      domain = domain.trim();
      if (String(domain).charAt(domain.length - 1).toLowerCase() === String(domain).charAt(domain.length - 1).toUpperCase()) {
        return false;
      }
      const domObject = tldjs.parse(domain);
      const result = (domObject.isValid && domObject.tldExists);
      if (!result) {
        return false;
      }
      return true;
    }
    return false;

  }

  static domainValidationWithoutTLD(d: string) {
    if (d) {
      d = d.trim();
      if (String(d).charAt(d.length - 1).toLowerCase() === String(d).charAt(d.length - 1).toUpperCase()) {
        return false;
      }

      const domObject = tldjs.parse(d);
      const result = (domObject.isValid && domObject.tldExists && (domObject.domain != null || domObject.subdomain != null));
      if (!result) {
        return false;
      }
      return true;
    }
    return false;

  }

  static captchaValidator(control) {
    // RFC 2822 compliant regex
    if (control != null && control.value != '') {
      return null;
    } else {
      return { 'invalidCaptcha': true };
    }
  }

  static gsmValidator(control) {
    // RFC 2822 compliant regex
    if (control == null || control.value == null || control.value === '') {
      return null;
    } else if (validator.isMobilePhone(control.value, 'tr-TR')) {
      return null;
    } else {
      return { 'invalidPhoneNumber': true };
    }
  }

  static passwordValidator(control) {
    // {8,100}           - Assert password is between 8 and 100 characters
    // (?=.*[0-9])       - Assert a string has at least one number
    // (?=.*[A-Z])        - Assert a string has at least one capital letter
    if (control == null || control.value == null) {
      return null;
    } else if (control.value.match(/^(?=.*[0-9])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,100}$/)) {
      return null;
    } else {
      return { 'invalidPassword': true };
    }
  }

  static matchingPasswords(passwordKey: string, passwordConfirmationKey: string): any {
    return (group: UntypedFormGroup) => {
      const password = group.controls[passwordKey];
      const confirmPassword = group.controls[passwordConfirmationKey];
      // password alanları boşsa null dönmeli
      if ((password.value == null || password.value == '') && (confirmPassword.value == null || confirmPassword.value == '')) {
        return null;
      } else if (password.value !== confirmPassword.value) {
        return confirmPassword.setErrors({ mismatchedPasswords: true });
      }
    };
  }

  static matchingEmail(emailKey: string, emailConfirmationKey: string): any {
    return (group: UntypedFormGroup) => {
      const email = group.controls[emailKey];
      const confirmEmail = group.controls[emailConfirmationKey];

      if ((email.value == null || email.value == '') && (confirmEmail.value == null || confirmEmail.value == '')) {
        return null;
      } else if (email.value !== confirmEmail.value) {
        return confirmEmail.setErrors({ unsolicitedMailAddress: true });
      }
    };
  }
  static isValidIpWithLocals(ipForCheck: string) {
    const reg = new RegExp(ValidationService.ipv4v6Pattern);

    const isValid = ipForCheck.match(reg);
    if (isValid) {
      const a = ipForCheck.split('.');
      if (a.length != 4) {
        return false;
      }
    }
    if (!isValid) {
      return false;
    }
    return true;
  }

}
