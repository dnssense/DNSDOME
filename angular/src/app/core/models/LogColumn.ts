/**
 * Created by fatih on 09.08.2016.
 */
export class LogColumn {
  public name: string;
  public beautyName: string;
  public hrType: string;
  public aggsType: string;
  public checked: boolean;

  public inputPattern?: RegExp;
  /**
   * hide in manual filter...
   */
  public hide?: boolean;
  public placeholder?: string;
}
