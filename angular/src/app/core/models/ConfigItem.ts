import {CriteriaItem} from './CriteriaItem';
import {AggregationItem} from './AggregationItem';


export class ConfigItem {

  public header: string;
  public hslColor: string;
  public type: string;
  public criteriaItems: CriteriaItem[] = [];
  public columns: AggregationItem[] = [];

}
