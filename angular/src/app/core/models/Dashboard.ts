import {SearchSetting} from "../models/SearchSetting";
import { KeyValueModel } from './Utility';
/**
 * Created by fatih on 02.09.2016.
 */
export class Dashboard {
  public id: number = -1;
  public name: string = "";
  public date: string = "";
  public user: string;
  public setting: SearchSetting[] = [];
  public changed: boolean = false;
  public saved: boolean = false;
  public refresh: number = -1;
  public isDefault: boolean = false;
  public system: boolean = false;


}


export class DataPanelModel {
  name : string;
  activeCount : number;
  passiveCount: number;
}