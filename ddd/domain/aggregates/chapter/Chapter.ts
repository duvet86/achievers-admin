import type { IAggregateRoot } from "../../IAggregateRoot";
import { Entity } from "../../Entity";

export interface IChapterProps {
  name: string;
  address: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export class Chapter extends Entity implements IAggregateRoot {
  private _name: string;
  private _address: string;
  private _createdAt?: Date | string;
  private _updatedAt?: Date | string;

  private constructor(
    { name, address, createdAt, updatedAt }: IChapterProps,
    id?: number,
  ) {
    super(id);
    this._name = name;
    this._address = address;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  public static create(props: IChapterProps, id?: number) {
    return new Chapter(props, id);
  }

  public update(name: string, address: string): void {
    this._name = name;
    this._address = address;
  }
}
