import { AgentType } from './AgentType';
import { SecurityProfile } from './SecurityProfile';

export class Agent {
    id: number;
    agentType: AgentType;
    agentAlias: string;
    blockMessage: string;
    isCpEnabled: boolean;
    captivePortalIp: string;
    cyberXRayIp:string;
    staticSubnetIp: IpWithMask[];
    dynamicIpDomain: string;
    rootProfile: SecurityProfile;
    logo:any;
}

export interface IpWithMask {
    baseIp: string
    mask: number
}