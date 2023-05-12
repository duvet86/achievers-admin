import type {
  SessionData,
  SessionStorage,
  SessionIdStorageStrategy,
} from "@remix-run/node";

interface MemorySessionStorageOptions {
  /**
   * The Cookie used to store the session id on the client, or options used
   * to automatically create one.
   */
  cookie?: SessionIdStorageStrategy["cookie"];
}

type FlashDataKey<Key extends string> = `__flash_${Key}__`;

type CreateMemorySessionStorageFunction = <
  Data = SessionData,
  FlashData = Data
>(
  options?: MemorySessionStorageOptions
) => SessionStorage<Data, FlashData>;

type CreateSessionStorageFunction = <Data = SessionData, FlashData = Data>(
  strategy: SessionIdStorageStrategy<Data, FlashData>
) => SessionStorage<Data, FlashData>;

type FlashSessionData<Data, FlashData> = Partial<
  Data & {
    [Key in keyof FlashData as FlashDataKey<Key & string>]: FlashData[Key];
  }
>;

type SessionFactoryMap = Map<
  string,
  {
    data: SessionData;
    expires?: Date | undefined;
  }
>;

declare global {
  var __sfm: SessionFactoryMap | undefined;
}

let map: SessionFactoryMap;

/**
 * Creates and returns a simple in-memory SessionStorage object, mostly useful
 * for testing and as a reference implementation.
 *
 * Note: This storage does not scale beyond a single process, so it is not
 * suitable for most production scenarios.
 *
 * @see https://remix.run/utils/sessions#creatememorysessionstorage
 */
export const createMemorySessionStorageFactory =
  (
    createSessionStorage: CreateSessionStorageFunction
  ): CreateMemorySessionStorageFunction =>
  <Data = SessionData, FlashData = Data>({
    cookie,
  }: MemorySessionStorageOptions = {}): SessionStorage<Data, FlashData> => {
    let uniqueId = 0;
    if (!global.__sfm) {
      global.__sfm = new Map<
        string,
        { data: FlashSessionData<Data, FlashData>; expires?: Date }
      >();
    }
    map = global.__sfm;

    return createSessionStorage({
      cookie,
      async createData(data, expires) {
        let id = (++uniqueId).toString();
        map.set(id, { data, expires });
        return id;
      },
      async readData(id) {
        if (map.has(id)) {
          let { data, expires } = map.get(id)!;

          if (!expires || expires > new Date()) {
            return data as FlashSessionData<Data, FlashData>;
          }

          // Remove expired session data.
          if (expires) map.delete(id);
        }

        return null;
      },
      async updateData(id, data, expires) {
        map.set(id, { data, expires });
      },
      async deleteData(id) {
        map.delete(id);
      },
    });
  };
