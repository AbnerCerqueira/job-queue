import { setTimeout } from 'node:timers/promises';
import NodeEventBus from './events/node-event-bus';
import { logger } from './logging/logger';
import { FinishJobEvent, NewJobEvent } from './queue/job';
import { Queue } from './queue/queue';

(async () => {
  // inicia fila
  const queue = Queue.getInstance();
  queue.listen();

  // adiciona 3 jobs à fila
  for (let i = 1; i <= 3; i += 1) {
    NodeEventBus.getInstance().emit(
      new NewJobEvent({
        id: `${i}`,
        status: 'PENDING',
        createdAt: new Date(),
        payload: {},
      })
    );
  }

  logger.info(queue.findAllJobs());

  // finaliza primeiro job
  const fiveSeconds = 5000;
  await setTimeout(fiveSeconds);
  NodeEventBus.getInstance().emit(
    new FinishJobEvent({
      id: '1',
      status: 'DONE',
      createdAt: new Date(),
      payload: {},
    })
  );

  // finaliza segundo job
  await setTimeout(fiveSeconds);
  NodeEventBus.getInstance().emit(
    new FinishJobEvent({
      id: '2',
      status: 'FAILED',
      createdAt: new Date(),
      payload: {},
    })
  );

  // terceiro job ira sofrer timeout
})();
