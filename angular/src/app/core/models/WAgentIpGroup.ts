import { Ip } from './Ip';
export class WAgentIpGroup {
  public id = -1;
  public ips: number[] = [];

  public beginIpAddress: string;
  public endIpAddress: string;


  public constructor() {
    if (this.ips == null || this.ips.length === 0) {
      this.ips = Ip.emptyIP();
    }
    if (this.ips != null && this.ips.length > 0) {
      this.initIpBlocks();
    }

  }

  public initIpBlocks() {
    this.beginIpAddress = this.ips[0] + '.' + this.ips[1] + '.' + this.ips[2] + '.' + this.ips[3];
    if (this.ips[3] != this.ips[4]) {
      this.endIpAddress = this.ips[0] + '.' + this.ips[1] + '.' + this.ips[2] + '.' + this.ips[4];
    } else {
      this.endIpAddress = '';
    }
  }

}
