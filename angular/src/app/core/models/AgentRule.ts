import {Agent} from './Agent';
import {AgentInfo} from './DeviceGroup';

export enum AgentRuledBy {
    ADUSR   = '01ADUSR',
    ADGRP   = '02ADGRP',
    MAC     = '03MAC',
    LOCIP   = '04LOCIP',
    BOX     = '05BOX'
}

export interface AgentRule {
    companyId: number;
    ruleId: number;
    ruledBy: string;
    keyword: string;
    agentId: number;

    agent?: AgentInfo;
}
