import { AgentType } from './AgentType';
import { AgentGroup } from './DeviceGroup';
import { SecurityProfile } from './SecurityProfile';

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
    rootProfile: SecurityProfile = new SecurityProfile();
    agentGroup: AgentGroup;
    logo?: any = null;
    agents: any[];
    conf?: any;
    uuid: string;

    /**
     * @description For UI
     */
    selected?= false;
    isDisabled = false;
    isAlive = true;
    isUserDisabled = false;
}

export interface IpWithMask {
    baseIp: string;
    mask: number;
}

export interface AgentDetail {
    id: number;
    uuid: string;
    insertDate: string;
    isUserDisabled: number;
    companyId: number;
    hostname: string;
    mac: string;
    os: string;
}
