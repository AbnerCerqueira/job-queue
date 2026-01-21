import { logger } from '../../../logging/logger.ts';
import { sendJobSimulator } from '../../../main.ts';
import type { JobEvents } from '../events/job-events.ts';
import { nodeJobEvents } from '../events/node-job-events.ts';
import type { Job } from '../job.ts';
import { inMemoryJobRepository } from '../repositories/in-memory-job-repository.ts';
import type { JobRepository } from '../repositories/job-repository.ts';

const jobProcessTimeoutMs = 1 * 60 * 1000;

const twoSecMs = 2000;

export class JobQueue {
  private processing = false;
  private pollingInterval: NodeJS.Timeout | null = null;

  private static instance: JobQueue | null = null;

  private readonly repository: JobRepository;
  private readonly jobEvents: JobEvents;
  private readonly sendJob: (job: Job) => Promise<void>;
  private readonly timeoutMs: number;
  private readonly pollMs: number;

  private constructor(
    repository: JobRepository,
    jobEvents: JobEvents,
    sendJob: (job: Job) => Promise<void>,
    timeoutMs: number,
    pollMs = twoSecMs
  ) {
    this.repository = repository;
    this.jobEvents = jobEvents;
    this.sendJob = sendJob;
    this.timeoutMs = timeoutMs;
    this.pollMs = pollMs;
  }

  public static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue(
        inMemoryJobRepository,
        nodeJobEvents,
        sendJobSimulator,
        jobProcessTimeoutMs
      );
    }

    return JobQueue.instance;
  }

  public start() {
    if (this.pollingInterval) {
      return;
    }

    logger.info('start');

    this.pollingInterval = setInterval(() => {
      this.process();
    }, this.pollMs);
  }

  public stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = null;
  }
  private async process() {
    if (this.processing) {
      logger.info('[QUEUE] job processando');
      return;
    }

    this.processing = true;

    try {
      while (true) {
        const job = await this.repository.findNextPending();
        if (!job) {
          logger.info('[QUEUE] nenhum job encontrado');
          break;
        }

        try {
          await this.repository.updateStatus(job.id, 'PROCESSING');
          logger.info(`[QUEUE] proximo job ${job.id} começou a processar`);
          this.repository.dump();
          await this.sendJob(job);
          await this.waitForCompletion(job.id);
        } catch (err) {
          logger.info(
            `[QUEUE] job ${job.id} deu timeout ${this.timeoutMs}, ${err}`
          );
          this.repository.dump();
          await this.repository.updateStatus(job.id, 'FAILED');
        }
      }
    } finally {
      this.processing = false;
    }
  }

  private async waitForCompletion(jobId: string): Promise<void> {
    const mostUpdatedJob = await this.repository.findById(jobId);

    if (!mostUpdatedJob) {
      throw new Error(`[QUEUE] job ${jobId} não encontrado`);
    }

    if (mostUpdatedJob?.status === 'DONE') {
      return;
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('timeout')),
        this.timeoutMs
      );
      this.jobEvents.onceJobCompleted(`JOB_COMPLETED:${jobId}`, () => {
        logger.info(`[QUEUE] job ${jobId} finalizado`);
        this.repository.dump();
        clearTimeout(timer);
        resolve();
      });
    });
  }
}
