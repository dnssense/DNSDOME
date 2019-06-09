import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { TranslatorService } from './translator.service';


export class ConfigHost{
  www: string;
  brand: string;
  aboutus:string;
  logofullUrl:string;
  logoImage:string;
  iconImage:string;
  title:string;
  privacyUrl:string;
  captcha_key:string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
   host:ConfigHost;
  constructor(private translationservice: TranslatorService) {
    console.log('constructor configservice');
    this.host=new ConfigHost();
    if (window.location.host.indexOf("dnssense") >= 0) {
      this.host.www = 'https://www.dnssense.com';
      this.host.brand = 'DNSSense';
      this.host.aboutus='https://www.dnssense.com/about-us';
      this.host.logoImage='logo-dnssense.png';
      this.host.iconImage='favicon-dnssense.png'
      this.host.logofullUrl=window.location.protocol+'://'+window.location.host+(window.location.port||'')+'/assets/img/logo-dnssense.png';
      this.host.title="DnsSense";
      this.host.privacyUrl='https://www.dnssense.com/privacy-statement.htm';
      this.host.captcha_key='6LcjI3oUAAAAAAUW7egWmq0Q9dbLOcRPQUqcUD58';

    }else if (window.location.host.indexOf("cyte") >= 0) {
      this.host.www = 'https://www.cybercyte.io';
      this.host.brand = 'DNSCyte';
      this.host.aboutus='https://www.cybercyte.io/the-company/';
      this.host.logoImage='logo-dnscyte.png';
      this.host.iconImage='favicon-dnscyte.png'
      this.host.logofullUrl=window.location.protocol+'://'+window.location.host+(window.location.port||'')+'/assets/img/logo-dnscyte.png';
      this.host.title="DnsCyte";
      this.host.privacyUrl='https://www.cybercyte.io/privacy-and-cookie-policy/';
      this.host.captcha_key='6LcjI3oUAAAAAAUW7egWmq0Q9dbLOcRPQUqcUD58';// dnccyte için yenisi gerekli
    } else
      if (window.location.host.indexOf("roksit") >= 0) {
        this.host.www = 'https://www.roksit.com';
        this.host.brand = 'Roksit';
        this.host.aboutus='https://www.roksit.com/about-us';
        this.host.logoImage='logo-roksit.png';
        this.host.iconImage='favicon-roksit.png'
        this.host.logofullUrl=window.location.protocol+'://'+window.location.host+(window.location.port||'')+'/assets/img/logo-roksit.png';
        this.host.title='Roksit';
        this.host.privacyUrl='https://www.roksit.com/privacy-statement.htm';
        this.host.captcha_key='6LdZopwUAAAAALG7uO9JV88w2y9sQnTJ9M0Lqhrg';
      } else {
       /*  this.host.www = 'https://www.roksit.com';
        this.host.brand = 'Roksit';
        this.host.aboutus='https://www.roksit.com/about-us';
        this.host.logoImage='logo-roksit.png';
        this.host.logofullUrl=window.location.protocol+'://'+window.location.host+(window.location.port||'')+'/assets/img/logo-roksit.png'; */
         this.host.www = 'https://www.dnssense.com';
        this.host.brand = 'DNSSense';
        this.host.aboutus='https://www.dnssense.com/about-us';
        this.host.logoImage='logo-dnssense.png';
        this.host.iconImage='favicon-dnssense.png'
        this.host.logofullUrl=window.location.protocol +'://'+window.location.host +(window.location.port||'')+'/assets/img/logo-dnssense.png';
        this.host.title='DnsSense';
        this.host.privacyUrl='https://www.dnssense.com/privacy-statement.htm';
        this.host.captcha_key='6LcjI3oUAAAAAAUW7egWmq0Q9dbLOcRPQUqcUD58';
      }
  }

  init() {
    this.translationservice.initLanguages();
  }

  getApiUrl(): string {


    return window.location.protocol
      + "//" + window.location.hostname
      + (window.location.port != "" ? (":" + window.location.port) : "") + "/api";
  }
  setDefaultLanguage(lang: string) {
    this.translationservice.setDefaultLang(lang);
  }
  getTranslationLanguage() {
    return this.translationservice.getCurrentLang();
  }

  setTranslationLanguage(lang: string) {
    this.translationservice.use(lang);
  }

}
