import { Injectable } from '@angular/core';
import { RkUtilityService } from 'roksit-lib';
import { TranslatorService } from './translator.service';

export class ConfigHost {
  www: string;
  brand: 'CyberCyte' | 'DNSSense' | 'Roksit' | 'CMERP';
  aboutus: string;
  logofullUrl: string;
  logoImage: string;
  logoDarkImage: string;
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
  constructor(private translationservice: TranslatorService, private rkUtilityService: RkUtilityService) {

    this.host = new ConfigHost();
    if (window.location.host.indexOf('dnssense') >= 0) {
      this.host.www = 'https://www.dnssense.com';
      this.host.brand = 'DNSSense';
      this.host.aboutus = 'https://www.dnssense.com/about-us';
      this.host.logoImage = 'logo-dnssense.png';
      this.host.logoDarkImage = 'logo-dnssense.png';
      this.host.iconImage = 'favicon-dnssense.png';
      this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/logo-dnssense.png';
      this.host.title = 'DnsSense';
      this.host.privacyUrl = 'https://www.dnssense.com/privacy-statement.htm';
      this.host.captcha_key = '6LcjI3oUAAAAAAUW7egWmq0Q9dbLOcRPQUqcUD58';
      this.host.docUrl = 'http://docs.roksit.com';
      this.host.supportUrl = 'https://dnssense.com';
      this.host.onlineHelpUrl = 'https://dnssense.com';
      this.host.portal = 'https://portal.dnssense.com';
    } else if (window.location.host.indexOf('cyte') >= 0) {
      this.host.www = 'https://www.cybercyte.com';
      this.host.brand = 'CyberCyte';
      this.host.aboutus = 'https://www.cybercyte.com/about-us/';
      this.host.logoImage = 'logo-dnscyte.svg';
      this.host.logoDarkImage = 'dnscyte-white.svg';
      this.host.iconImage = 'favicon-dnscyte.png';
      this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/logo-dnscyte.svg';
      this.host.title = 'DnsCyte';
      this.host.privacyUrl = 'https://www.cybercyte.com/privacy-and-cookie-policy/';
      this.host.captcha_key = '6LcjI3oUAAAAAAUW7egWmq0Q9dbLOcRPQUqcUD58'; // dnccyte için yenisi gerekli
      this.host.docUrl = 'https://docs.dnscyte.com';

      this.host.portal = 'https://portal.dnscyte.com';
      this.host.supportUrl = 'https://support.cybercyte.com/portal/home';
      this.host.onlineHelpUrl = 'https://docs.dnscyte.com';
    } else
      if (window.location.host.indexOf('roksit') >= 0) {
        this.host.www = 'https://www.roksit.com';
        this.host.brand = 'Roksit';
        this.host.aboutus = 'https://www.roksit.com/about-us';
        this.host.logoImage = 'logo-roksit.png';
        this.host.logoDarkImage = 'roksit-white.svg';
        this.host.iconImage = 'favicon-roksit.png';
        this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/logo-roksit.png';
        this.host.title = 'Roksit';
        this.host.privacyUrl = 'https://www.roksit.com/privacy-statement.htm';
        this.host.captcha_key = '6LdZopwUAAAAALG7uO9JV88w2y9sQnTJ9M0Lqhrg';
        this.host.docUrl = 'https://docs.roksit.com';
        this.host.portal = 'https://portal.roksit.com';
        this.host.supportUrl = 'https://roksit.com';
        this.host.onlineHelpUrl = 'https://roksit.com';

      } else
        if (window.location.host.indexOf('cmerp') >= 0) {
          this.host.www = 'https://www.cmerp.my';
          this.host.brand = 'CMERP';
          this.host.aboutus = 'https://www.cmerp.my/about-us';
          this.host.logoImage = 'logo-cmerp.jpg';
          this.host.logoDarkImage = 'logo-cmerp.jpg';
          this.host.iconImage = 'favicon-cmerp.png';
          this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/logo-cmerp.png';
          this.host.title = 'CMERP';
          this.host.privacyUrl = 'https://www.cmerp.my/privacy-statement.htm';
          this.host.captcha_key = '6LfvWs0ZAAAAAPGo7js_t5j2UtXncod_UyZAo_L8';
          this.host.docUrl = 'https://docs.cmerp.my';
          this.host.portal = 'https://adf.cmerp.my';
          this.host.supportUrl = 'https://cmerp.my';
          this.host.onlineHelpUrl = 'https://cmerp.my';
        } else {
          this.host.www = 'https://www.dnssense.com';
          this.host.brand = 'DNSSense';
          this.host.aboutus = 'https://www.dnssense.com/about-us';
          this.host.logoImage = 'logo-dnssense.png';
          this.host.logoDarkImage = 'logo-dnssense.png';
          this.host.iconImage = 'favicon-dnssense.png';
          this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/logo-dnssense.png';
          this.host.title = 'DnsSense';
          this.host.privacyUrl = 'https://www.dnssense.com/privacy-statement.htm';
          this.host.captcha_key = '6LcjI3oUAAAAAAUW7egWmq0Q9dbLOcRPQUqcUD58';
          this.host.docUrl = 'https://docs.roksit.com';
          this.host.portal = 'https://portal.dnssense.com';
          this.host.supportUrl = 'https://dnssense.com';
          this.host.onlineHelpUrl = 'https://dnssense.com';
        }
  }
  loadLanguage(userId: number): string | undefined {
    try {


      if (userId) {
        const language = localStorage.getItem(`language_for_user_${userId}`);
        if (language) {
          return language;
        }
      }


    } catch (err) {
      console.log(err);
    }
    return undefined;

  }
  saveLanguage(userId: number, lang: string) {
    try {

      if (userId) {
        localStorage.setItem(`language_for_user_${userId}`, lang);
      }
      this.translationservice.use(lang);


    } catch (err) {
      console.log(err);
    }

  }

  init(userId?: number) {

    const language = this.loadLanguage(userId);
    this.translationservice.initLanguages(language);
    if (language) {
      this.translationservice.setDefaultLang(language);
      this.translationservice.use(language);
    }
    const themeColor = this.getThemeColor(userId);
    if (themeColor) {
      this.rkUtilityService.changeTheme(themeColor === 'dark');
    }

  }

  getApiUrl(): string {
    return window.location.protocol
      + '//' + window.location.hostname
      // tslint:disable-next-line: triple-equals
      + (window.location.port != '' ? (':' + window.location.port) : '') + '/api';
  }

  setDefaultLanguage(userId: number, lang: string) {

    this.translationservice.setDefaultLang(lang);
    this.translationservice.use(lang);
    this.saveLanguage(userId, lang);
  }

  getTranslationLanguage(): string {
    return this.translationservice.getCurrentLang();
  }

  saveThemeColor(userId: number, color: string) {

    if (userId) {
      localStorage.setItem(`theme_for_user_${userId}`, color);
    }
    this.rkUtilityService.changeTheme(color === 'dark');
  }
  getThemeColor(userId: number) {
    if (userId) {
      return localStorage.getItem(`theme_for_user_${userId}`);
    }
    return null;
  }

}
