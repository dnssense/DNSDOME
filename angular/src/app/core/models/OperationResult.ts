/**
 * Created by fatih on 25.08.2016.
 */
export class OperationResult {
  public object: any;
  public type: string;
  public message: string;
  public status: number;
  public title: string;

  constructor() {

  }

  public static  getResult(type: string, title: string, message: string): OperationResult {
    let result: OperationResult = new OperationResult();
    result.message = message;
    result.title = title;
    result.type = type;

    return result;
  }
}
