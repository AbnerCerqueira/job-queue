import EventEmitter from 'node:events';
import type { JobEvents, JobEventsTypes } from './job-events';

export class NodeJobEvents implements JobEvents {
  private readonly eventEmitter: EventEmitter;

  public constructor() {
    this.eventEmitter = new EventEmitter();
  }

  public onceJobCompleted(event: JobEventsTypes, handler: () => void): void {
    this.eventEmitter.once(event, handler);
  }
  public emitJobCompleted(event: JobEventsTypes): void {
    this.eventEmitter.emit(event);
  }
}

export const nodeJobEvents = new NodeJobEvents();
