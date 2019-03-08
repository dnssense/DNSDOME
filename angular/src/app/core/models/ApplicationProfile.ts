import {WApplication} from "./WApplication";
/**
 * Created by fatih on 08.08.2016.
 */

export class ApplicationProfile {
  public id: number = -1;
  public profileName: string = "";
  public profileBlockedApps: WApplication[] = [];
  public profileAllowedApps: WApplication[] = [];

  public system: boolean;

}
