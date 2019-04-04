
export interface RestUser{
    id:string;//mandatory
    username:string;//mandatory
    name?:string;
    password:string;//mandatory
    isActive:number;//mandatory
    isLocked:number;//mandatory
    isTwoFactorAuthentication:number;//mandatory
    isVerified:number;//mandatory
    source:string|'local'|'google'|null|undefined;//mandatory
    gsm?:string;
    gsmCode?:string;
    language?:string;
}


export interface RestPreloginResponse{
    prelogin:string;
    user:RestPreUserResponse;
}

export interface RestPreUserResponse{
    isTwoFactorAuthentication:number;
    gsm:string;
}

export interface RestPreloginSmsResponse{
    prelogin:string;
    smscode:string;
}


export interface RestPreloginSmsConfirmRequet{
    prelogin:string;
    smscode:string;
    code:string;

}




export interface RestSmsResponse{
    id:string;
}

export interface RestSmsConfirmRequest{
    id:string;
    code:string;
}