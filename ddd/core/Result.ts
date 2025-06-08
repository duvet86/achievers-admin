interface Success<T> {
  ok: true;
  value?: T;
}
interface Failure<E> {
  ok: false;
  error?: E;
}

export type Result<T, E = Error> = Success<T> | Failure<E>;

export class OK<T = void> {
  private _success: Success<T>;

  constructor(value?: T) {
    this._success = { ok: true, value };
  }

  public get success(): Success<T> {
    return this._success;
  }

  public getValue(): T | null {
    return this._success.value ?? null;
  }
}

export class Fail<E = string> {
  private _failure: Failure<E>;

  constructor(value?: E) {
    this._failure = { ok: false, error: value };
  }

  public get failure(): Failure<E> {
    return this._failure;
  }

  public getError(): E | null {
    return this._failure.error ?? null;
  }
}
