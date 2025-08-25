/* eslint-disable @typescript-eslint/no-explicit-any */
type IValueObjectProps = Record<string, any>;

export abstract class ValueObject<T extends IValueObjectProps> {
  public readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public isEqualTo(valueObject?: ValueObject<T>): boolean {
    if (valueObject?.props === undefined) {
      return false;
    }

    return shallowEqualObjects(this.props, valueObject.props);
  }
}

function shallowEqualObjects(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
) {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (
      !Object.prototype.hasOwnProperty.call(obj2, key) ||
      obj1[key] !== obj2[key]
    ) {
      return false;
    }
  }

  return true;
}
