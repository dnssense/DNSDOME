import { Category } from './core/models/Category';

/**
 * Created by fatih on 28.10.2016.
 */

export class ArrayUtils {
  public static categoryCompare(a: Category, b: Category): number {
    var nameA = a.categoryName.toUpperCase(); // ignore upper and lowercase
    var nameB = b.categoryName.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  }
}
