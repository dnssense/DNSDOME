import { environment } from '../../environments/environment';

// Headers HTTP
export const HEADER_X_SECRET = 'X-Secret';
export const HEADER_X_TOKEN_ACCESS = 'X-TokenAccess';
export const HEADER_X_DIGEST = 'X-Digest';
export const HEADER_X_ONCE = 'X-Once';
export const HEADER_WWW_AUTHENTICATE = 'WWW-Authenticate';
export const HEADER_AUTHENTICATION = 'X-Authorization';
export const CSRF_CLAIM_HEADER = 'X-HMAC-CSRF';

// Local storage keys
export const STORAGE_ACCOUNT_TOKEN = 'token';
export const STORAGE_REFRESH_TOKEN = 'refreshToken';
export const STORAGE_ACCOUNT = 'account';
export const DEVICE_GROUP = 'DEVICEGROUP';
// Common http root api
export const BACKEND_API_PATH = '/api';
export const BACKEND_API_AUTHENTICATE_PATH = '/authenticate';
export const CAPTCHA_MESSAGE = 'You must click to prove you\'re not a bot or a robot.'

export class UrlMatcher {
  public static matches(url: string): boolean {
    return url.indexOf(BACKEND_API_PATH) !== -1
      && url.indexOf(BACKEND_API_PATH + BACKEND_API_AUTHENTICATE_PATH) === -1;
  }
}

export class Constants {



  /*  public static getCompany() {
     return environment.COMPANY;
   } */

  /*   public static getCompanyLogo() {
      return environment.COMPANY_LOGO;
    } */



  public static getCaptchaMessage() {
    return CAPTCHA_MESSAGE;
  }

  public static isDemo() {
    return environment.environment === 'demo';
  }

  public static isProd() {
    return environment.environment === 'production';
  }

  public static isTest() {
    return environment.environment === 'test';
  }

  public static isEonscope() {
    return environment.environment === 'eonscope';
  }

}
