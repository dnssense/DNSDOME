import { User } from './User';
import { PublicIP } from './PublicIP';
import { Agent } from './Agent';

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
}
