import { Role } from './Role';

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
    public roles: Role;
    public companyId: number;
    public twoFactorAuthentication = false;
    public usageType: number;

    /**
     * @description For UI
     */
    selected ?= false;
}

export class UserExtended extends User {
    passwordAgain: string;
}
