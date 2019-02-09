/**
 * Created by fatih on 08.08.2016.
 */
export class WApplication {
  public id: number = -1;
  public name: string = "";
  public isVisible: boolean;
  public imagePath: string;
  public parent: WApplication;
  public colorCategory: string;
  public colorCategoryOrder: number;
}
