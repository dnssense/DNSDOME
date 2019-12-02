import { User } from './User';
import { PublicIP } from './PublicIP';
import { Agent } from './Agent';

export class Box {
  public id: number = -1;
  public host: string = '';
  public hostDetail: string = '';
  public agent: Agent = new Agent();
  public interfaces: string = '';
  public user: User;
  public location: PublicIP = new PublicIP();
  public isActive: boolean = false;
  public conf: string=''
  public ipAddress: string = "";//
  public ips: number[] = [];//
  public isCaptivePortal: boolean;

  public constructor() {

  }
}
