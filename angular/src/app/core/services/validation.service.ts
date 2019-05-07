import { Injectable } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {Ip} from "../models/Ip";
import * as validator  from 'validator';
import * as tldjs from "tldjs";

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

constructor() { }

static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
  let config = {
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
    return {'unsolicitedMailAddress': true};
  } else if (validator.isEmail(control.value)) {
    return null;
  } else {
    return {'emailAddress': true};
  }
}

static domainValidation(control) {
  debugger;
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
    const result = (domObject.isValid && domObject.tldExists && (domObject.domain != null || domObject.subdomain != null));
    if (!result) {
      return { 'invalidDomain': true };
    }
    return result;
  }
  return {'invalidDomain': true};

}

static captchaValidator(control) {
  // RFC 2822 compliant regex
  if (control != null && control.value != '') {
    return null;
  } else {
    return {'invalidCaptcha': true};
  }
}

static gsmValidator(control) {
  // RFC 2822 compliant regex
  if (control == null || control.value == null || control.value === '') {
    return null;
  } else if (validator.isMobilePhone(control.value, 'tr-TR')) {
    return null;
  } else {
    return {'invalidPhoneNumber': true};
  }
}

static passwordValidator(control) {
  // {8,100}           - Assert password is between 8 and 100 characters
  // (?=.*[0-9])       - Assert a string has at least one number
  //(?=.*[A-Z])        - Assert a string has at least one capital letter
  if (control == null || control.value == null) {
    return null;
  } else if (control.value.match(/^(?=.*[0-9])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,100}$/)) {
    return null;
  } else {
    return {'invalidPassword': true};
  }
}

static matchingPasswords(passwordKey: string, passwordConfirmationKey: string): any {
  return (group: FormGroup) => {
    let password = group.controls[passwordKey];
    let confirmPassword = group.controls[passwordConfirmationKey];
    //password alanları boşsa null dönmeli
    if ((password.value == null || password.value == "") && (confirmPassword.value == null || confirmPassword.value == "")) {
      return null;
    } else if (password.value !== confirmPassword.value) {
      return confirmPassword.setErrors({mismatchedPasswords: true});
    }
  }
}

static matchingEmail(emailKey: string, emailConfirmationKey: string): any {
  return (group: FormGroup) => {
    let email = group.controls[emailKey];
    let confirmEmail = group.controls[emailConfirmationKey];
    
    if ((email.value == null || email.value == "") && (confirmEmail.value == null || confirmEmail.value == "")) {
      return null;
    } else if (email.value !== confirmEmail.value) {
      return confirmEmail.setErrors({unsolicitedMailAddress: true});
    }
  }
}

static checkIp(ips: Ip[], key: string): any {
  return (group: FormGroup) => {
    let object = group.controls[key];
    //ip list is empty
    if (ips == null || ips.length == 0) {
      return object.setErrors({required: true});
    } else {
      for (let ip of ips) {
        for (var i = 0; i <= ips.length; i++) {
          //ip bos olamaz
          if (ip[i] == '')
          {
            return object.setErrors({required: true});
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
          return object.setErrors({invalidIp: true});
        }
      }
    }
  }
}

}
