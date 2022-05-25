import {AgentRule} from './AgentRule';

export interface LDAPUserGroup {
    groupSid: string;
    groupName: string;
    userSid: string;
    userName: string;
    companyId: number;
    adDomain: string;

    rules?: AgentRule[];
    memberCount?: number;
    lastSyncTime?: number|string;
}
