import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { TranslatorService } from './translator.service';


export class ConfigHost {
  www: string;
  brand: string;
  aboutus: string;
  logofullUrl: string;
  logoImage: string;
  iconImage: string;
  title: string;
  privacyUrl: string;
  supportUrl: string;
  onlineHelpUrl: string;
  captcha_key: string;
  docUrl: string;
  portal: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  host: ConfigHost;
  constructor(private translationservice: TranslatorService) {

    this.host = new ConfigHost();
    if (window.location.host.indexOf('dnssense') >= 0) {
      this.host.www = 'https://www.dnssense.com';
      this.host.brand = 'DNSSense';
      this.host.aboutus = 'https://www.dnssense.com/about-us';
      this.host.logoImage = 'logo-dnssense.png';
      this.host.iconImage = 'favicon-dnssense.png';
      this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/logo-dnssense.png';
      this.host.title = 'DnsSense';
      this.host.privacyUrl = 'https://www.dnssense.com/privacy-statement.htm';
      this.host.captcha_key = '6LcjI3oUAAAAAAUW7egWmq0Q9dbLOcRPQUqcUD58';
      this.host.docUrl = 'http://docs.dnssense.com/DnsSense_Secure_DNS_Setup_Guide.pdf';
      this.host.supportUrl = 'https:dnssense.com';
      this.host.onlineHelpUrl = 'https:dnssense.com';
      this.host.portal = 'https:portal.dnssense.com';
    } else if (window.location.host.indexOf('cyte') >= 0) {
      this.host.www = 'https://www.cybercyte.com';
      this.host.brand = 'CyberCyte';
      this.host.aboutus = 'https://www.cybercyte.com/about-us/';
      this.host.logoImage = 'logo-dnscyte.svg';
      this.host.iconImage = 'favicon-dnscyte.png';
      this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/logo-dnscyte.svg';
      this.host.title = 'DnsCyte';
      this.host.privacyUrl = 'https://www.cybercyte.com/privacy-and-cookie-policy/';
      this.host.captcha_key = '6LcjI3oUAAAAAAUW7egWmq0Q9dbLOcRPQUqcUD58'; // dnccyte için yenisi gerekli
      this.host.docUrl = 'http://docs.netcyte.co/Secure_DNS_Setup_Guide.pdf';
      this.host.portal = 'https:portal.dnscyte.com';
      this.host.supportUrl = 'https://support.cybercyte.com/portal/home';
      this.host.onlineHelpUrl = 'https://docs.dnscyte.com';
    } else
      if (window.location.host.indexOf('roksit') >= 0) {
        this.host.www = 'https://www.roksit.com';
        this.host.brand = 'Roksit';
        this.host.aboutus = 'https://www.roksit.com/about-us';
        this.host.logoImage = 'logo-roksit.png';
        this.host.iconImage = 'favicon-roksit.png';
        this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/logo-roksit.png';
        this.host.title = 'Roksit';
        this.host.privacyUrl = 'https://www.roksit.com/privacy-statement.htm';
        this.host.captcha_key = '6LdZopwUAAAAALG7uO9JV88w2y9sQnTJ9M0Lqhrg';
        this.host.docUrl = 'http://docs.roksit.com/Roksit_Secure_DNS_Setup_Guide.pdf';
        this.host.portal = 'https:portal.roksit.com';
        this.host.supportUrl = 'https:roksit.com';
        this.host.onlineHelpUrl = 'https:roksit.com';
      } else {

        this.host.www = 'https://www.dnssense.com';
        this.host.brand = 'DNSSense';
        this.host.aboutus = 'https://www.dnssense.com/about-us';
        this.host.logoImage = 'logo-dnssense.png';
        this.host.iconImage = 'favicon-dnssense.png';
        this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/logo-dnssense.png';
        this.host.title = 'DnsSense';
        this.host.privacyUrl = 'https://www.dnssense.com/privacy-statement.htm';
        this.host.captcha_key = '6LcjI3oUAAAAAAUW7egWmq0Q9dbLOcRPQUqcUD58';
        this.host.docUrl = 'http://docs.dnssense.com/DnsSense_Secure_DNS_Setup_Guide.pdf';
        this.host.portal = 'https:portal.dnssense.com';
        this.host.supportUrl = 'https:dnssense.com';
        this.host.onlineHelpUrl = 'https:dnssense.com';
      }
  }
  loadLanguage(): string|undefined {
    try {
      const language = localStorage.getItem('language');
    if (language) {
      return language;
    }

    } catch (err) {
      console.log(err);
    }
    return undefined;

  }
  saveLanguage(lang: string) {
    try {
      localStorage.setItem('language', lang);
      this.translationservice.use(lang);


    } catch (err) {
      console.log(err);
    }

  }

  init() {
    const language = this.loadLanguage();
    this.translationservice.initLanguages(language);


  }

  getApiUrl(): string {
    return window.location.protocol
      + '//' + window.location.hostname
      // tslint:disable-next-line: triple-equals
      + (window.location.port != '' ? (':' + window.location.port) : '') + '/api';
  }
  setDefaultLanguage(lang: string) {
    this.translationservice.setDefaultLang(lang);
    this.translationservice.use(lang);
    this.saveLanguage(lang);
  }
  getTranslationLanguage(): string {
    return this.translationservice.getCurrentLang();
  }


}
