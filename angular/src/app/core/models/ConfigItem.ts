import {CriteriaItem} from "./CriteriaItem";
import {AggregationItem} from "./AggregationItem";
/**
 * Created by fatih on 03.08.2016.
 */

export class ConfigItem {

  public header: string;
  public hslColor: string;
  public type: string;
  public criteriaItems: CriteriaItem[] = [];
  public columns: AggregationItem[] = [];

}
