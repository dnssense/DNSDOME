import { Company } from './Company';

export class SignupBean {
    public username: string;
    public confirmEmail: string;
    public password: string;
    public name: string;
    public surname: string;
    public gsm: string;
    public company: Company;
    public passwordAgain: string;
    public activationCode: string;
    public c_answer: string;
    public webSite: string = "";
    public industry: string = " ";
    public companyCountry: string = " ";
    public personnelCount: string = "1-50";
    public usageType: string = "Home Account";
    public source: string = "Other";
    public address1: string = " ";
    public address2: string = " ";
    public city: string = " ";
    public postCode: string = " ";
    public regionState: string = " ";
    public gsmCode: string = "+44";
}

export class RegisterUser {
    public username: string;
    public password: string;
    public c_answer: string;
    public language?: string;
    public city?: string;
    public country?: string;
    public ip?: string;
    public timezone?: string;
    public countryCode?: string;
    public gsmCode?: string;

    public name?: string;
    public companyName?: string;
    public gsm?: string;
    public campaignCode?: string;
    public brand?: string;

}
