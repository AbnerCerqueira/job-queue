/** biome-ignore-all lint/suspicious/useAwait: aqui pode*/

import { logger } from '../../../logging/logger.ts';
import type { Job, JobStatus } from '../job.ts';
import type { JobRepository } from './job-repository.ts';

export class InMemoryJobRepository implements JobRepository {
  private readonly jobs: Job[] = [];

  public async save(job: Job): Promise<void> {
    this.jobs.push(job);
  }

  public async findById(jobId: string): Promise<Job | null> {
    return this.jobs.find((j) => j.id === jobId) ?? null;
  }

  public async findNextPending(): Promise<Job | null> {
    return this.jobs.find((j) => j.status === 'PENDING') ?? null;
  }

  public async updateStatus(id: string, status: JobStatus): Promise<void> {
    const foundJob = this.jobs.find((j) => j.id === id);

    if (foundJob) {
      foundJob.status = status;
    }
  }

  public dump() {
    logger.info(this.jobs);
  }
}

export const inMemoryJobRepository = new InMemoryJobRepository();
