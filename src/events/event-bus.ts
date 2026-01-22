/** biome-ignore-all lint/suspicious/noExplicitAny: necessário para generalização */
export interface EventBus {
  on<T extends object>(
    eventClass: new (...args: any[]) => T,
    handler: (event: T) => void
  ): void;
  once<T extends object>(
    eventClass: new (...args: any[]) => T,
    handler: (event: T) => void
  ): void;
  emit<T extends object>(event: T): void;
  off<T extends object>(
    eventClass: new (...args: any[]) => T,
    handler: (event: T) => void
  ): void;
}
