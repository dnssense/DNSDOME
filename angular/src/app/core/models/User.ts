
import { Role } from './Role';

export interface ApiKey {
    id: number;
    key: string;
    description: string;
    who: string;
    companyId: number;
    userId: number;
    profile?: string

}
export class User {
    public id = -1;
    public username: string;
    public password: string;
    public name: string;
    public surname: string;
    public gsm: string;
    public gsmCode: string;
    public language: string;
    public locked = false;
    public isLocked: number;
    public active = true;
    public isActive: number;
    public role: Role[];
    public companyId: number;
    public twoFactorAuthentication = false;
    public usageType: number;
    public isGsmVerified = false;
    public apikey?: ApiKey;


    /**
     * @description For UI
     */
    selected?= false;
}

export class UserExtended extends User {
    passwordAgain: string;
}
