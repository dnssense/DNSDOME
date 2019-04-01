
import { User } from './User';

export class Session{
    currentUser:User;
    //roles:[];
    token:string;
    refreshToken:string;
}