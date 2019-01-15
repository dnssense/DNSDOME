/**
 * Created by fatih on 02.09.2016.
 */
export class Ip {
  public ip: number[] = [];

  constructor(ips: number[]) {
    this.ip = ips;
  }

  public static emptyIP(): number[] {
    return [];
  }
}
