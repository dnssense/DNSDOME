import { Role } from './Role';

export class User {
    active: boolean;
    emailVerification: boolean
    gsm: string
    gsmCode: string
    gsmVerification: boolean
    id: number
    language: string
    locked: boolean
    name: string
    roles: Array<Role>
    surname: string
    twoFactorAuthentication: boolean
    usageType: number
    userName: string
}