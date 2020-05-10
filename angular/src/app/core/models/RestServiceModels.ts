
export interface RestUser {
    id: string; // mandatory
    username: string; // mandatory
    name?: string;
    password: string; // mandatory
    isActive: number; // mandatory
    isLocked: number; // mandatory
    isTwoFactorAuthentication: number; // mandatory
    isGsmVerified:number;//mandatory
    isVerified: number; // mandatory
    source: string | 'local' | 'google' | null | undefined; // mandatory
    gsm?: string;
    gsmCode?: string;
    language?: string;
    companyId: number;
}

export interface RestPreloginResponse {
    prelogin: string;
    user: RestPreUserResponse;
}

export interface RestPreUserResponse {
    isTwoFactorAuthentication: number;
    gsm: string;
}

export interface RestPreloginSmsResponse {
    prelogin: string;
    smscode: string;
}

export interface RestPreloginSmsConfirmRequet {
    prelogin: string;
    smscode: string;
    code: string;
}

export interface RestSmsResponse {
    id: string;
}

export interface RestSmsConfirmRequest {
    id: string;
    code: string;
}

// tslint:disable-next-line: no-empty-interface
export interface RestEmptyResponse { }

export interface RestUserUpdateRequest {

    name?: string;
    password?: string;
    oldPassword?: string;
    isActive?: number;
    isLocked?: number;
    isTwoFactorAuthentication?: number;
    isVerified?: number;
    gsm?: string;
    gsmCode?: string;
    language?: string;

}
