import { AgentType } from './AgentType';
import { SecurityProfile } from './SecurityProfile';
import { AgentGroup } from './DeviceGroup';

export class Agent {
    id: number;
    agentType: AgentType;
    agentAlias: string;
    mac: string;
    blockMessage: string;
    isCpEnabled: boolean;
    captivePortalIp: string;
    cyberXRayIp: string;
    staticSubnetIp: IpWithMask[];
    dynamicIpDomain: string;
    rootProfile: SecurityProfile;
    agentGroup: AgentGroup;
    logo?: any = null;

    agents: any[];

    /**
     * @description For UI
     */
    selected?= false;
}

export interface IpWithMask {
    baseIp: string
    mask: number
}