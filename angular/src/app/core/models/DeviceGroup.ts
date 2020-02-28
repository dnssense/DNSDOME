import { SecurityProfile } from './SecurityProfile';
import { AgentType } from './AgentType';

export class AgentGroup {
    id =  -1;
    groupName: string;
}

export class DeviceGroup {
    agentGroup: AgentGroup = new AgentGroup();
    agents: AgentInfo[] = [];
    rootProfile: SecurityProfile = new SecurityProfile();
}

export class AgentInfo {
    id?: number;
    agentType: AgentType;
    agentAlias: string;
    blockMessage?: string;
    mac: string;
    agentGroup?: AgentGroup;
    rootProfile: SecurityProfile = new SecurityProfile();
}
