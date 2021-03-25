
import { User } from './User';

export class Session {
    currentUser: User;
    token: string;
    refreshToken: string;
    clientId?: any;
}
