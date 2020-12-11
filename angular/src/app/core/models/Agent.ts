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
    conf?: string;
    uuid: string;

    /**
     * @description For UI
     */
    selected?= false;
    isDisabled = false;
    isSmartCacheEnabled = false;
    uninstallPassword?: string;
    disablePassword?: string;
    isAlive = true;
    isUserDisabled = false;
    isUserDisabledSmartCache = false;
    os?: string;
    hostname?: string;
    version?: string;

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
    isUserDisabledSmartCache: number;
    companyId: number;
    hostname: string;
    mac: string;
    os: string;
    version: string;
}
