import { Injectable } from '@angular/core';
import { RkUtilityService } from 'roksit-lib';
import { TranslatorService } from './translator.service';
import { RkMenuItem } from 'roksit-lib/lib/models/rk-menu.model';
import { WindowInterruptSource } from '@ng-idle/core';

export class ConfigHost {
  www: string;
  brand: 'CyberCyte' | 'DNSSense' | 'Roksit' | 'CMERP';
  aboutus: string;
  logofullUrl: string;
  logoImage: string;
  logoDarkImage: string;
  logoCompanyImage: string;
  logoCompanyDarkImage: string;
  iconImage: string;
  title: string;
  privacyUrl: string;
  supportUrl: string;
  termsOfServiceUrl: string;
  onlineHelpUrl: string;
  captcha_key: string;
  docUrl: string;
  portal: string;
  hiddenMenus?: string[];
  cyberXRayUrl: string;
  defaultGSMCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  static menuItems: RkMenuItem[] = [
    { id: 0, path: '/admin/dashboard', text: 'PageName.Dashboard', icon: 'dashboard', selected: false, roles: ['ROLE_CUSTOMER', 'ROLE_USER'] },
    { id: 1, path: '/admin/reports/monitor', text: 'PageName.Monitor', icon: 'monitor', selected: false, roles: ['ROLE_CUSTOMER', 'ROLE_USER'] },
    { id: 2, path: '/admin/reports/custom-reports', text: 'PageName.CustomReports', icon: 'custom-reports', selected: false, roles: ['ROLE_CUSTOMER', 'ROLE_USER'] },
    {
      id: 3, path: '/admin/', text: 'PageName.Deployment', icon: 'dashboard', selected: false, roles: ['ROLE_CUSTOMER'],
      subMenu: [
        { id: 3.1, path: 'deployment/public-ip', text: 'PageName.PublicIp', icon: 'public-ip', selected: false, roles: ['ROLE_CUSTOMER'] },
        { id: 3.2, path: 'deployment/dns-relay', text: 'PageName.ADIntegration', icon: 'ad-integration', selected: false, roles: ['ROLE_CUSTOMER'] },
        { id: 3.3, path: 'deployment/roaming-clients', text: 'PageName.RoamingClients', icon: 'roaming-clients', selected: false, roles: ['ROLE_CUSTOMER'] },
      ]
    },
    { id: 4, path: '/admin/reports/audit', text: 'PageName.AuditLogs', icon: 'audit', selected: false, roles: ['ROLE_CUSTOMER'] },
    {
      id: 5, path: '/admin/', text: 'PageName.Settings', icon: 'settings', selected: false, roles: ['ROLE_CUSTOMER', 'ROLE_USER'],
      subMenu: [
        { id: 5.1, path: 'settings/users', text: 'PageName.Users', icon: 'user', selected: false, roles: ['ROLE_CUSTOMER'] },
        { id: 5.2, path: 'settings/apikeys', text: 'PageName.ApiKeys', icon: 'apikey', selected: false, roles: ['ROLE_CUSTOMER'] },
        { id: 5.3, path: 'settings/scheduled-reports', text: 'PageName.SavedReports', icon: 'saved-reports', selected: false, roles: ['ROLE_CUSTOMER', 'ROLE_USER'] },
        { id: 5.4, path: 'settings/common-bwlist', text: 'PageName.CommonBWListProfile', icon: 'bwlist', selected: false, roles: ['ROLE_CUSTOMER'] },
        { id: 5.5, path: 'settings/profiles', text: 'PageName.SecurityProfiles', icon: 'security-profiles', selected: false, roles: ['ROLE_CUSTOMER'] },
        { id: 5.6, path: 'settings/query-category', text: 'PageName.QueryCategory', icon: 'tools', selected: false, roles: ['ROLE_CUSTOMER', 'ROLE_USER'] },
        { id: 5.8, path: 'settings/theme-mode', text: 'PageName.ThemeMode', icon: 'theme-mode', selected: false, roles: ['ROLE_CUSTOMER', 'ROLE_USER'] },
      ]
    }
  ];

  host: ConfigHost;
  constructor(private translationservice: TranslatorService, private rkUtilityService: RkUtilityService) {

    this.host = new ConfigHost();
    this.host.cyberXRayUrl = `https://www.cyber-xray.com/#/admin/dashboard/`;
    if (window.location.host.startsWith('beta.'))
      this.host.cyberXRayUrl = window.location.protocol + `//beta.cyber-xray.com/#/admin/dashboard/`;
    if (window.location.host.startsWith('localhost'))
      this.host.cyberXRayUrl = window.location.protocol + `//localhost:4202/#/admin/dashboard/`;

    if (window.location.host.indexOf('dnssense') >= 0) {
      this.host.www = 'https://www.dnssense.com';
      this.host.brand = 'DNSSense';
      this.host.aboutus = 'https://www.dnssense.com/about-us';
      this.host.logoImage = 'DNSDome-OnLightBG.svg';
      this.host.logoDarkImage = 'DNSDome-OnDarkBG.svg';
      this.host.logoCompanyImage = 'DNSSense-OnLightBG.svg';
      this.host.logoCompanyDarkImage = 'DNSSense-OnDarkBG.svg';
      this.host.iconImage = 'dnssense-favicon.ico';
      this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/DNSSense-OnLightBG.svg';
      this.host.title = 'DnsSense';
      this.host.privacyUrl = 'https://www.dnssense.com/privacy-policy';
      this.host.captcha_key = '6LcjI3oUAAAAAAUW7egWmq0Q9dbLOcRPQUqcUD58';
      this.host.docUrl = 'http://docs.roksit.com';
      this.host.supportUrl = 'https://dnssense.com/contact';
      this.host.termsOfServiceUrl = 'https://www.dnssense.com/application-terms-of-service';
      this.host.onlineHelpUrl = 'https://dnssense.com/faq';
      this.host.portal = 'https://portal.dnssense.com';
      this.host.hiddenMenus = []; // put paths to hide menu exp: ['settings/query-category', 'deployment/roaming-clients', 'deployment/devices'];
      this.host.defaultGSMCode = '+44';
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
      this.host.termsOfServiceUrl = 'https://www.cybercyte.com/privacy-and-cookie-policy/';
      this.host.onlineHelpUrl = 'https://docs.dnscyte.com';
      this.host.hiddenMenus = []; // put paths to hide menu exp: ['settings/query-category', 'deployment/roaming-clients', 'deployment/devices'];
      this.host.defaultGSMCode = '+44';
    } else if (window.location.host.indexOf('roksit') >= 0) {
      this.host.www = 'https://www.roksit.com';
      this.host.brand = 'Roksit';
      this.host.aboutus = 'https://www.roksit.com/company';
      this.host.logoImage = 'DNSDome-OnLightBG.svg';
      this.host.logoDarkImage = 'DNSDome-OnDarkBG.svg';
      this.host.logoCompanyImage = 'RoksitLogo-OnLightBG.svg';
      this.host.logoCompanyDarkImage = 'RoksitLogo-OnDarkBG.svg';
      this.host.iconImage = 'roksit-favicon.ico';
      this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/DNSDome-OnLightBG.svg';
      this.host.title = 'Roksit';
      this.host.privacyUrl = 'https://www.roksit.com/privacy-policy';
      this.host.captcha_key = '6LdZopwUAAAAALG7uO9JV88w2y9sQnTJ9M0Lqhrg';
      this.host.docUrl = 'https://docs.roksit.com';
      this.host.portal = 'https://portal.roksit.com';
      this.host.supportUrl = 'https://www.roksit.com/contact';
      this.host.termsOfServiceUrl = 'https://www.roksit.com/en/application-terms-of-service';
      this.host.onlineHelpUrl = 'https://www.roksit.com';
      this.host.hiddenMenus = []; // put paths to hide menu exp: ['settings/query-category', 'deployment/roaming-clients', 'deployment/devices'];
      this.host.defaultGSMCode = '+90';
      if (window.location.host.indexOf('local.roksit') >= 0) {
        this.host.hiddenMenus = ['settings/query-category', 'deployment/roaming-clients', 'deployment/dns-relay'];
      }
    } else if (window.location.host.indexOf('cmerp') >= 0) {
      this.host.www = 'https://www.cmerp.my';
      this.host.brand = 'CMERP';
      this.host.aboutus = 'https://www.cmerp.my';
      this.host.logoImage = 'logo-cmerp.png';
      this.host.logoDarkImage = 'logo-cmerp.png';
      this.host.iconImage = 'favicon-cmerp.png';
      this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/logo-cmerp.png';
      this.host.title = 'CMERP';
      this.host.privacyUrl = 'https://www.cmerp.my';
      this.host.termsOfServiceUrl = 'https://www.cmerp.my';
      this.host.captcha_key = '6LfvWs0ZAAAAAPGo7js_t5j2UtXncod_UyZAo_L8';
      this.host.docUrl = 'https://docs.cmerp.my';
      this.host.portal = 'https://adf.cmerp.my';
      this.host.supportUrl = 'https://www.cmerp.my/index.html#contact';
      this.host.onlineHelpUrl = 'https://www.cmerp.my';
      this.host.hiddenMenus = []; // put paths to hide menu exp: ['settings/query-category', 'deployment/roaming-clients', 'deployment/devices'];
      this.host.defaultGSMCode = '+60';
    } else {
      this.host.www = 'https://www.roksit.com';
      this.host.brand = 'Roksit';
      this.host.aboutus = 'https://www.roksit.com/company';
      this.host.logoImage = 'DNSDome-OnLightBG.svg';
      this.host.logoDarkImage = 'DNSDome-OnDarkBG.svg';
      this.host.logoCompanyImage = 'RoksitLogo-OnLightBG.svg';
      this.host.logoCompanyDarkImage = 'RoksitLogo-OnDarkBG.svg';
      this.host.iconImage = 'roksit-favicon.ico';
      this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/DNSDome-OnLightBG.svg';
      this.host.title = 'Roksit';
      this.host.privacyUrl = 'https://www.roksit.com/privacy-policy';
      this.host.captcha_key = '6LdZopwUAAAAALG7uO9JV88w2y9sQnTJ9M0Lqhrg';
      this.host.docUrl = 'https://docs.roksit.com';
      this.host.portal = 'https://portal.roksit.com';
      this.host.supportUrl = 'https://www.roksit.com/contact';
      this.host.termsOfServiceUrl = 'https://www.roksit.com/en/application-terms-of-service';
      this.host.onlineHelpUrl = 'https://www.roksit.com';
      this.host.hiddenMenus = []; // put paths to hide menu exp: ['settings/query-category', 'deployment/roaming-clients', 'deployment/devices'];
      this.host.defaultGSMCode = '+90';
      if (window.location.host.indexOf('local.roksit') >= 0) {
        this.host.hiddenMenus = ['settings/query-category', 'deployment/roaming-clients', 'deployment/dns-relay'];
      }
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
    this.translationservice.initLanguages(language, this.host);
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
