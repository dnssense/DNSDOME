import { Clearance } from './Clearance';

export class Role{
    id:number;
    name:string;
    description:string;
    clearences:Array<Clearance>   
}



export interface RestUserRoleRight{
    roles:RestRole[];
}

export interface RestRole{
    name:string;
    rights:RestRight[];
}

export interface RestRight{
    name:string
}