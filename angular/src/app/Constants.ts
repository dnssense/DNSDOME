import {environment} from "../environments/environment";

/**
 * Created by fatih on 15.01.2017.
 */

//Headers HTTP
export const HEADER_X_SECRET: string = 'X-Secret';
export const HEADER_X_TOKEN_ACCESS: string = 'X-TokenAccess';
export const HEADER_X_DIGEST: string = 'X-Digest';
export const HEADER_X_ONCE: string = 'X-Once';
export const HEADER_WWW_AUTHENTICATE: string = 'WWW-Authenticate';
export const HEADER_AUTHENTICATION: string = 'X-Authorization';
export const CSRF_CLAIM_HEADER: string = "X-HMAC-CSRF";

//Local storage keys
export const STORAGE_ACCOUNT_TOKEN: string = 'token';
export const STORAGE_REFRESH_TOKEN: string = 'refreshToken';
export const STORAGE_ACCOUNT: string = 'account';
//Common http root api
export const BACKEND_API_PATH: string = '/api';
export const BACKEND_API_AUTHENTICATE_PATH: string = '/authenticate';
export const CAPTCHA_MESSAGE = "You must click to prove you're not a bot or a robot."

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

  public static getCaptchaKey() {
    return environment.API_CAPTCHA_KEY;
  }

  public static getCaptchaMessage() {
    return CAPTCHA_MESSAGE;
  }

  public static isDemo() {
    return environment.environment == 'demo';
  }

  public static isProd() {
    return environment.environment == 'production';
  }

  public static isTest() {
    return environment.environment == 'test';
  }

  public static isEonscope() {
    return environment.environment == 'eonscope';
  }

}
