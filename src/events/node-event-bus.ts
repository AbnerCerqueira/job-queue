/** biome-ignore-all lint/suspicious/noExplicitAny: necessário para generalização */
import EventEmitter from 'node:events';
import type { EventBus } from './event-bus';
export default class NodeEventBus implements EventBus {
  private readonly eventEmitter: EventEmitter;

  private static instance: NodeEventBus;

  private constructor() {
    this.eventEmitter = new EventEmitter();
  }

  public static getInstance() {
    if (!NodeEventBus.instance) {
      NodeEventBus.instance = new NodeEventBus();
    }

    return NodeEventBus.instance;
  }

  public on<T extends object>(
    eventClass: new (...args: any[]) => T,
    handler: (event: T) => void
  ): void {
    const eventName = eventClass.name;
    this.eventEmitter.on(eventName, handler);
  }

  public once<T extends object>(
    eventClass: new (...args: any[]) => T,
    handler: (event: T) => void
  ): void {
    const eventName = eventClass.name;
    this.eventEmitter.once(eventName, handler);
  }

  public emit<T extends object>(event: T): void {
    const eventName = event.constructor.name;
    this.eventEmitter.emit(eventName, event);
  }

  public off<T extends object>(
    eventClass: new (...args: any[]) => T,
    handler: (event: T) => void
  ): void {
    const eventName = eventClass.name;
    this.eventEmitter.off(eventName, handler);
  }
}
