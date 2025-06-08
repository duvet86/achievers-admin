type IValueObjectProps = Record<string, unknown>;

export abstract class ValueObject<T extends IValueObjectProps> {
  public readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public isEqualTo(valueObject?: ValueObject<T>): boolean {
    if (valueObject?.props === undefined) {
      return false;
    }

    return this.isEqual(valueObject);
  }

  private isEqual(valueObject: ValueObject<T>): boolean {
    const keysA = Object.keys(this.props);
    const keysB = Object.keys(valueObject.props);

    const objectA = this.props;
    const objectB = valueObject.props;

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (
        !Object.prototype.hasOwnProperty.call(objectB, key) ||
        objectA[key] !== objectB[key]
      ) {
        return false;
      }
    }

    return true;
  }
}
