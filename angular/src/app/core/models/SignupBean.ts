import { Company } from './Company';

export class SignupBean {
    public userName: string;
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
