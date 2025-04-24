import { IpAddress } from "../types/ip";

export class WAgentIpGroup {
  public id = -1;
  public ipNumbers: number[] = [];
  public beginIpAddress: IpAddress | null = null;
  public endIpAddress: IpAddress | null = null;


  public constructor() {
    if (this.ipNumbers == null || this.ipNumbers.length === 0) {
      this.ipNumbers = []
    }

    if (this.ipNumbers != null && this.ipNumbers.length > 0) {
      this.initIpBlocks();
    }

  }

  public initIpBlocks() {
    this.beginIpAddress = `${this.ipNumbers[0]}.${this.ipNumbers[1]}.${this.ipNumbers[2]}.${this.ipNumbers[3]}`;

    if (this.ipNumbers[3] != this.ipNumbers[4]) {
      this.endIpAddress = `${this.ipNumbers[0]}.${this.ipNumbers[1]}.${this.ipNumbers[2]}.${this.ipNumbers[4]}`;
    }
  }

}
