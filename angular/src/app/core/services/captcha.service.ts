import { Injectable } from '@angular/core';
import { Response, Headers, RequestOptions, Http } from "@angular/http";
import { TranslatorService } from './translator.service';


@Injectable({
  providedIn: 'root'
})
export class CaptchaService {
  static translator: any;

  constructor(public http: Http, private translator: TranslatorService) {
    this.http = http;
    this.translator = translator;
  }

  static validCaptcha(captcha: string) {

    if (captcha == null || captcha == '') {
      alert(this.translator.translate('CaptchaMessage'));
      return false;
    }

    return true;
  }

}
