// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class Entity<TInitProps> {
  public readonly id: number;

  constructor(id?: number) {
    this.id = id ?? 0;
  }
}
