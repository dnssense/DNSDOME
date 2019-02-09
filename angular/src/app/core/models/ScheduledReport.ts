import {User} from "./User";
import {Dashboard} from "./Dashboard";
import {SearchSetting} from "./SearchSetting";
/**
 * Created by fatih on 02.09.2016.
 */
export class ScheduledReport {
  public id: number = -1;
  public searchSetting: SearchSetting;
  public dashboard: Dashboard;
  public users: User[] = [];
  public period: string = "d";
  public format: string = "PDF";
  public quickReport: boolean = false;
  public note: string = "";
}
