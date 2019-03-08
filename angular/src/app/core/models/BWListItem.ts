import {Category} from './Category';

/**
 * Created by fahri on 13.10.2017.
 */

export class BWListItem {
  public id: number = -1;
  public domain: string;
  public date: Date;
  public block = false;
  public comment: string = '';
  public categories: number[] = [];

  constructor(domain: string, block: boolean, comment: string, categories: number[]) {
    this.domain = domain;
    this.block = block;
    this.date = new Date();
    this.comment = comment;
    this.categories = categories;

  }

  public addCategory(cat:number){
    this.categories.push(cat);
  }

  public removeCategory(cat:number){
    this.categories.push(cat);
  }


 public static equals(curent:BWListItem,other: BWListItem): boolean {

  //  console.log("::id:"+curent.id+":::"+curent.domain)
    if (!curent.id && !curent.domain){
      return false;
    }

   // console.log("::: "+curent.id+":::"+other.id+":::"+(curent.id === other.id)+" :::"+(curent.id!==-1 && other.id!==-1 && curent.id === other.id))
    return (curent.id!==-1 && other.id!==-1 && curent.id === other.id) || curent.domain===(other.domain);
  }

}
