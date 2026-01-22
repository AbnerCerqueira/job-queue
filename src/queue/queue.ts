import type { EventBus } from '@/events/event-bus';
import NodeEventBus from '@/events/node-event-bus';
import { logger } from '@/logging/logger';
import { FinishJobEvent, type Job, NewJobEvent } from './job';
import {
  ExampleOrchestrateProcess,
  type OrchestrateProcess,
} from './orchestrate';

const tenSecondsMs = 10_000;
const TIMEOUT_MS = tenSecondsMs;

export class Queue {
  private static instance: Queue | null = null;

  private readonly allJobs: Job[] = [];

  private runningJob: Job | null = null;

  private isProcessing = false;

  private currentTimeout: NodeJS.Timeout | null = null;

  private constructor(
    private readonly eventBus: EventBus,
    private readonly orchestrateProcess: OrchestrateProcess
  ) {}

  public static getInstance(): Queue {
    if (!Queue.instance) {
      Queue.instance = new Queue(
        NodeEventBus.getInstance(),
        new ExampleOrchestrateProcess()
      );
    }

    return Queue.instance;
  }

  public listen() {
    logger.info({ message: 'Queue is listening' });
    this.eventBus.on(NewJobEvent, this.newJobHandler());
    this.eventBus.on(FinishJobEvent, this.finishedJobHandler());
  }

  public findJobById(id: Job['id']) {
    return this.runningJob?.id === id
      ? this.runningJob
      : this.allJobs.find((job) => job.id === id);
  }

  public findAllJobs() {
    return this.allJobs;
  }

  private startJobProcess(job: Job) {
    job.status = 'PROCESSING';
    this.runningJob = job;
    this.orchestrateProcess.execute(job);
    this.currentTimeout = setTimeout(() => this.handleJobTimeout(), TIMEOUT_MS);
  }

  private newJobHandler() {
    return (event: NewJobEvent) => {
      const { job } = event;

      if (job.status !== 'PENDING') {
        return;
      }

      if (this.allJobs.some((pJob) => pJob.id === job.id)) {
        return;
      }

      this.allJobs.push(job);

      logger.info({ message: 'Novo job adicionado à fila', context: job });

      if (!this.isProcessing) {
        const firstJob = this.allJobs[0];

        this.isProcessing = true;
        this.startJobProcess(firstJob);
      }
    };
  }

  private finishedJobHandler() {
    return (event: FinishJobEvent) => {
      const { job } = event;

      if (job.id !== this.runningJob?.id) {
        return;
      }

      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
        this.currentTimeout = null;
      }

      logger.info({ message: 'Job finalizado', context: job });

      // remove job atual antes de pegar o proximo
      this.allJobs.shift();
      const nextJob = this.allJobs[0];

      if (!nextJob) {
        this.isProcessing = false;
        return;
      }

      this.startJobProcess(nextJob);
    };
  }

  private handleJobTimeout() {
    if (!this.runningJob) {
      return;
    }

    logger.warn({ message: 'Job timed out', context: this.runningJob });

    this.runningJob.status = 'FAILED';

    // remove job atual antes de pegar o proximo
    this.allJobs.shift();
    const nextJob = this.allJobs[0];

    if (!nextJob) {
      this.isProcessing = false;
      this.currentTimeout = null;
      return;
    }

    this.startJobProcess(nextJob);
  }
}
