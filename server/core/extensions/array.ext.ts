export abstract class ArrayExt {
  static includesAny(source: any[], target: any[]): boolean {
    for (const element of source) {
      if (target.includes(element)) return true;
    }
    return false;
  }
  static includesAll(source: any[], target: any[]): boolean {
    let foundCount = 0;
    let length = target.length;

    for (const element of target) {
      if (typeof element === "object")
        throw "Shouldn't use objects, comparing objects always return false !";
        
      if (source.includes(element)) foundCount++;

      if (foundCount === length) {
        return true;
      }
    }
    return false;
  }

  static hasTrash = (source: any[]) =>
    ArrayExt.includesAny(source, [undefined, null]);
}
