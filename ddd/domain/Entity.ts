export abstract class Entity {
  public readonly id: number;

  constructor(id?: number) {
    this.id = id ?? 0;
  }
}
