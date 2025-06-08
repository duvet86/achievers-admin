export interface IRepository<T> {
  findAllAsync(): Promise<T[]>;
  findByIdAsync(id: number): Promise<T | null>;
  saveAsync(entity: T): Promise<number>;
  deleteAsync(id: number): Promise<number>;
}
