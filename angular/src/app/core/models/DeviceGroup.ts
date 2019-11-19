import { SecurityProfile } from './SecurityProfile';
import { AgentType } from './AgentType';

export class DeviceGroup {
    agentGroup: AgentGroup = new AgentGroup();
    agents: AgentInfo[] = [];
    rootProfile: SecurityProfile = new SecurityProfile();
}

export class AgentInfo {
    id: number
    agentType: AgentType
    agentAlias: string
    blockMessage: string
    mac: string
}

export class AgentGroup {
    id: number = -1;
    groupName: string;
}
