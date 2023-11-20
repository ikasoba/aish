import { values } from "@syuilo/aiscript/";

export interface MapProxyOption<K, V> {
  get?(key: K): V | undefined;
  has?(key: K): boolean;
  set?(key: K, value: V): void;
  entries?(): IterableIterator<[K, V]>;
}

export class MapProxy<K, V> extends Map<K, V> {
  constructor(private opt: MapProxyOption<K, V>) {
    super();
  }

  get(key: K): V | undefined {
    if (this.opt.get) {
      return this.opt.get(key);
    }

    return super.get(key);
  }

  has(key: K): boolean {
    if (this.opt.has) {
      return this.opt.has(key);
    }

    return super.has(key);
  }

  set(key: K, value: V): this {
    if (this.opt.set) {
      this.opt.set(key, value);
      return this;
    }

    return super.set(key, value);
  }

  entries(): IterableIterator<[K, V]> {
    if (this.opt.entries) return this.opt.entries();
    return super.entries();
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }
}
