import { Injectable } from '@angular/core';
import { Response, Headers, RequestOptions, Http } from "@angular/http";
import { TranslatorService } from './translator.service';
import { NotificationService } from './notification.service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CaptchaService {


  constructor(private translator: TranslatorService, private notification: NotificationService) {


  }

  validCaptcha(captcha: string) {

    if (!environment.production)
      return true;
    if (captcha == null || captcha == '') {

      this.notification.error(this.translator.translate('CaptchaMessage'));

      return false;
    }

    return true;
  }

}
