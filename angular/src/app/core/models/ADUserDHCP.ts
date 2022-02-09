import {AgentRule} from './AgentRule';
import {LDAPUserGroup} from './LdapUserGroup';

export interface ADUserDHCP {
    id: number;
    boxSerial: string;
    ip: string;
    mac: string;
    host: string;
    adUser: string;
    adDomain: string;
    companyId: number;
    lastValidTime: number;

    rules?: AgentRule[];
    groups?: LDAPUserGroup[];
    groupNames?: string;
}
