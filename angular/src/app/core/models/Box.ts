import {User} from './User'; 
import { PublicIP } from './PublicIP';

export class Box {
  public id: number = -1;
  public host: string = '';
  public hostDetail: string = '';
  public interfaces: string = '';
  public user: User;
  public location: PublicIP = new PublicIP();
  public isActive: boolean = false;

  public ipAddress: string = "";//
  public ips: number[] = [];//
  public isCaptivePortal: boolean;

  public constructor() {

  }
}
