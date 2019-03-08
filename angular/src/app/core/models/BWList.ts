import {BWListItem} from './BWListItem';

/**
 * Created by fahri on 13.10.2017.
 */

export class BWList {
  public id: number = -1;
  public name: string;
  public createDate: string;
  public updateDate: string;
  public blackListItems: BWListItem[] = [];
  public whiteListItems: BWListItem[] = [];
  public override: boolean;
  public system: boolean;
}
