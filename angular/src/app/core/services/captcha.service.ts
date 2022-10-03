import { Injectable } from '@angular/core';
import { RkNotificationService } from 'roksit-lib';
import { TranslatorService } from './translator.service';


@Injectable({
  providedIn: 'root'
})
export class CaptchaService {


  constructor(private translator: TranslatorService, private notification: RkNotificationService) {


  }

  validCaptcha(captcha: string) {


    
    if (!captcha) {

      this.notification.error(this.translator.translate('CaptchaMessage'));

      return false;
    }

    return true;
  }

}
