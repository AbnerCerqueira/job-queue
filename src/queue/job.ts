const jobStatuses = ['PENDING', 'PROCESSING', 'DONE', 'FAILED'] as const;

export type JobStatus = (typeof jobStatuses)[number];

export type Job = {
  id: string;
  status: JobStatus;
  payload: unknown;
  createdAt: Date;
};

export class NewJobEvent {
  public constructor(public readonly job: Job) {}
}

export class FinishJobEvent {
  public constructor(public readonly job: Job) {}
}
