import { Agent } from './Agent';
import { PublicIP } from './PublicIP';
import { User } from './User';
import {AgentRule} from './AgentRule';

export class Box {
  id = -1;
  host = '';
  hostDetail = '';
  agent: Agent = new Agent();
  interfaces = '';
  user: User;
  location: PublicIP = new PublicIP();
  isActive = false;
  conf = '';
  ipAddress = ''; //
  ips: number[] = []; //
  isCaptivePortal: boolean;
  serial: string;
  uuid: string;

  rules?: AgentRule[];
  lastSyncTime?: number|string;
  clientCount?: number;
  boxSerial: string;
}
