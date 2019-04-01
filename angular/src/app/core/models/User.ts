import { Role } from './Role';
import { Company } from './Company';

export class User {
    public id: number = -1;
    public userName: string;
    public password: string;
    public name: string;
    public surname: string;
    public gsm: string;
    public gsmCode: string; 
    public language: string;
    public locked: boolean = false;
    public active: boolean = true;
    public roles: Role;
   // public company: Company;
   // public passwordAgain: string;
   /*  public gsmVerification: boolean = false;
    public emailVerification: boolean = false; */
    public twoFactorAuthentication: boolean = false;
    public usageType: number;

}


export interface RestUser{
    id:string;//mandatory
    username:string;//mandatory
    name?:string;
    password:string;//mandatory
    isActive:number;//mandatory
    isLocked:number;//mandatory
    isTwoFactorAuthentication:number,//mandatory
    isVerified:number;//mandatory
    source:string|'local'|'google'|null|undefined;//mandatory
    gsm?:string;
    gmsCode?:string,
    language?:string;
}
