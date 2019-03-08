import {Category} from "./Category";
/**
 * Created by fatih on 07.08.2016.
 */
export class DomainProfile {
  public id: number = -1;
  public name: string = "";
  public isMultiCategoryBlocked: boolean = true;
  public blockedCategories: Map<String, number>= new Map();
  public allowedDomains: string[] = [];
  public blockedDomains: string[] = [];
  public locked: boolean;
  public enablePositiveSecurityModel: boolean;

}
