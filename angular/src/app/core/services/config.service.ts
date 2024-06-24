import { Injectable } from '@angular/core';
import { RkUtilityService, RkMenuItem } from 'roksit-lib';
import { TranslatorService } from './translator.service';

export class ConfigHost {
  www: string;
  brand: 'CyberCyte' | 'DNSSense' | 'Roksit' | 'CMERP' | 'kvildns';
  aboutus: string;
  logofullUrl: string;
  logoCompanyLoginImage?: string;
  spinnerImage = '/assets/img/DNSDome Logo Reveal.svg';
  logoImage: string;
  logoDarkImage: string;
  logoCompanyImage: string;
  logoCompanyDarkImage: string;
  sidebarBgImage: string;
  iconImage: string;
  title: string;
  privacyUrl: string;
  supportUrl: string;
  termsOfServiceUrl: string;
  onlineHelpUrl: string;
  captcha_key: string;
  captchaType: 'Google' | 'Yandex' = 'Google';
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
    { id: 6, path: '/admin/reports/dns-tunnel', text: 'PageName.DnsTunnel', icon: 'dns-tunnel', selected: false, roles: ['ROLE_CUSTOMER', 'ROLE_USER'] },
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
        // { id: 5.8, path: 'settings/theme-mode', text: 'PageName.ThemeMode', icon: 'theme-mode', selected: false, roles: ['ROLE_CUSTOMER', 'ROLE_USER'] },
      ]
    },
    {id: 7, inBottom: true, path: 'logout', customClick: () => {}, text: 'PageName.Logout', icon: 'logout', selected: false, roles: ['ROLE_CUSTOMER', 'ROLE_USER']},
    {id: 8, inBottom: true, path: 'help', customClick: () => {}, text: 'PageName.Help', icon: 'help', selected: false, roles: ['ROLE_CUSTOMER', 'ROLE_USER']},
    {id: 9, inBottom: true, path: '/admin/account-settings', text: 'PageName.AccountSettings', icon: 'settings', selected: false, roles: ['ROLE_CUSTOMER', 'ROLE_USER']},
    {id: 10, inBottom: true, path: 'about', customClick: () => {}, text: 'PageName.About', icon: 'info', selected: false, roles: ['ROLE_CUSTOMER', 'ROLE_USER']},
  ];

  host: ConfigHost;
  constructor(private translationservice: TranslatorService, private rkUtilityService: RkUtilityService) {

    this.host = new ConfigHost();
    this.host.cyberXRayUrl = `https://www.cyber-xray.com/#/admin/dashboard/`;
    if (window.location.host.startsWith('beta.'))
      this.host.cyberXRayUrl = window.location.protocol + `//beta.cyber-xray.com/#/admin/dashboard/`;
    if (window.location.host.startsWith('localhost'))
      this.host.cyberXRayUrl = window.location.protocol + `//localhost:4202/#/admin/dashboard/`;

    if (window.location.host.indexOf('dnssense') >= 0 || window.location.host.indexOf('roksit') >= 0) {
      this.host.www = 'https://www.dnssense.com';
      this.host.brand = 'DNSSense';
      this.host.aboutus = 'https://www.dnssense.com/about-us';
      this.host.logoCompanyLoginImage = 'DnsSenseLogoCompany.svg';
      this.host.logoCompanyLoginImage = 'DNSSense-OnLightBG.svg';
      this.host.logoImage = 'DNSDome-OnLightBG.svg';
      this.host.logoDarkImage = 'DNSDome-OnDarkBG.svg';
      this.host.logoCompanyImage = 'DNSSense-OnLightBG.svg';
      this.host.logoCompanyDarkImage = 'DNSSense-OnDarkBG.svg';
      this.host.iconImage = 'dnssense-favicon.ico';
      this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/DNSSense-OnLightBG.svg';
      this.host.title = 'DNSSense';
      this.host.privacyUrl = 'https://www.dnssense.com/privacy-policy';
      this.host.captcha_key = '6Le6ge0pAAAAANeH_OEyIPWUtiH1B7aBrfK49sh0';//'6LcjI3oUAAAAAAUW7egWmq0Q9dbLOcRPQUqcUD58';
      this.host.docUrl = 'https://www.dnssense.com/support';
      this.host.supportUrl = 'https://dnssense.com/support';
      this.host.termsOfServiceUrl = 'https://www.dnssense.com/application-terms-of-service';
      this.host.onlineHelpUrl = 'https://www.dnssense.com/support';
      this.host.portal = 'https://portal.dnssense.com';
      this.host.hiddenMenus = []; // put paths to hide menu exp: ['settings/query-category', 'deployment/roaming-clients', 'deployment/devices'];
      this.host.defaultGSMCode = '+44';
      this.host.sidebarBgImage = '/assets/img/Dome_Sidebar_Logo.svg';
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
    }  else if (window.location.host.indexOf('cmerp') >= 0) {
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
      this.host.hiddenMenus = ['help']; // put paths to hide menu exp: ['settings/query-category', 'deployment/roaming-clients', 'deployment/devices'];
      this.host.defaultGSMCode = '+60';
    } else if (window.location.host.indexOf('kvil') >= 0) {
      this.host.www = 'https://www.kvildns.ru';
      this.host.brand = 'kvildns';
      this.host.aboutus = 'https://www.kvildns.ru/about-us';
      this.host.logoCompanyLoginImage = 'DNSCube-Company.svg';
      this.host.logoImage = 'DNSCube-Product.svg';
      this.host.logoCompanyImage = 'DNSCube-Company.svg';
      this.host.iconImage = 'favicon-dnscube.png';
      this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/DNSCube-Product.svg';
      this.host.title = 'kvildns';
      this.host.privacyUrl = 'https://www.kvildns.ru/privacy-policy';
      this.host.termsOfServiceUrl = 'https://kvildns.ru/terms-of-service';
      this.host.captcha_key = 'ysc1_2U8mj5Czn2rbGstdvi7gQdNGBYVIC6hQyrzaxGjv8e158a3d';
      this.host.captchaType = 'Yandex';
      this.host.docUrl = 'https://kvildns.ru';
      this.host.portal = 'https://portal.kvildns.ru';
      this.host.supportUrl = 'https://kvildns.ru';
      this.host.onlineHelpUrl = 'https://kvildns.ru/faq';
      this.host.hiddenMenus = ['deployment/roaming-clients']; // put paths to hide menu exp: ['settings/query-category', 'deployment/roaming-clients', 'deployment/devices'];
      this.host.defaultGSMCode = '+7';
      this.host.sidebarBgImage = '/assets/img/DNSCube_Sidebar.svg';
      this.host.spinnerImage = '/assets/img/DNSCube Logo Reveal.svg'
    } else {
      this.host.www = 'https://www.dnssense.com';
      this.host.brand = 'DNSSense';
      this.host.aboutus = 'https://www.dnssense.com/about-us';
      this.host.logoCompanyLoginImage = 'DnsSenseLogoCompany.svg';
      this.host.logoCompanyLoginImage = 'DNSSense-OnLightBG.svg';
      this.host.logoImage = 'DNSDome-OnLightBG.svg';
      this.host.logoDarkImage = 'DNSDome-OnDarkBG.svg';
      this.host.logoCompanyImage = 'DNSSense-OnLightBG.svg';
      this.host.logoCompanyDarkImage = 'DNSSense-OnDarkBG.svg';
      this.host.iconImage = 'dnssense-favicon.ico';
      this.host.logofullUrl = window.location.protocol + '://' + window.location.host + (window.location.port || '') + '/assets/img/DNSSense-OnLightBG.svg';
      this.host.title = 'DNSSense';
      this.host.privacyUrl = 'https://www.dnssense.com/privacy-policy';
      this.host.captcha_key = '6LcjI3oUAAAAAAUW7egWmq0Q9dbLOcRPQUqcUD58';
      this.host.docUrl = 'https://www.dnssense.com/support';
      this.host.supportUrl = 'https://dnssense.com/support';
      this.host.termsOfServiceUrl = 'https://www.dnssense.com/application-terms-of-service';
      this.host.onlineHelpUrl = 'https://www.dnssense.com/support';
      this.host.portal = 'https://portal.dnssense.com';
      this.host.hiddenMenus = []; // put paths to hide menu exp: ['settings/query-category', 'deployment/roaming-clients', 'deployment/devices'];
      this.host.defaultGSMCode = '+44';
      this.host.sidebarBgImage = '/assets/img/Dome_Sidebar_Logo.svg';
    }
    ConfigService.menuItems = ConfigService.menuItems.filter(menuItem => {
      if (this.host.hiddenMenus.includes(menuItem.path)) {return false}
      if (menuItem.subMenu) {
        menuItem.subMenu = menuItem.subMenu.filter(item => {
          return !this.host.hiddenMenus.includes(item.path);
        });
      }
      return true;
    })
    console.log(ConfigService.menuItems);
  }
  loadLanguage(userId: number): string | undefined {
    try {


      if (userId) {
        // const language = localStorage.getItem(`language_for_user_${userId}`);
        const language = 'en';
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

    let language = '';
    if (this.host.brand?.toLocaleLowerCase() === 'kvildns'){
        language = 'ru';
    } else {
        language = this.loadLanguage(userId);
    }
    this.translationservice.initLanguages(language, this.host);
    if (language) {
      this.translationservice.setDefaultLang(language);
      this.translationservice.use(language);
    }
    /*const themeColor = this.getThemeColor(userId);
    if (themeColor) {
      this.rkUtilityService.changeTheme(themeColor === 'dark');
    }*/
  }

  getApiUrl(): string {
    return this.getLocationUrl() + '/api';
  }

  getLocationUrl(): string {
      return window.location.protocol
        + '//' + window.location.hostname
        // tslint:disable-next-line: triple-equals
        + (window.location.port != '' ? (':' + window.location.port) : '');
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
    /*
    if (userId) {
      localStorage.setItem(`theme_for_user_${userId}`, color);
    }
    this.rkUtilityService.changeTheme(color === 'dark');
    */
  }
  getThemeColor(userId: number) {
    if (userId) {
      return localStorage.getItem(`theme_for_user_${userId}`);
    }
    return null;
  }
}
