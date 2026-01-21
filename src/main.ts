import { app } from './app';
import { logger } from './logging/logger';
import type { Job } from './modules/job/job';
import { JobQueue } from './modules/job/queue/job-queue';
import { seedJobs } from './seed';

export const sendJobSimulator = async (job: Job) => {
  logger.info(`[EXTERNAL] job ${job.id} enviado para serviço externo`);
};
(() => {
  seedJobs();

  const queue = JobQueue.getInstance();

  queue.start();

  app.listen({ port: 3000 }, () => logger.info('server is running'));
})();
