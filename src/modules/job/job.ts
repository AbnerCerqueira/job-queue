export type JobStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';

export type Job = {
  id: string;
  payload: unknown;
  status: JobStatus;
  createdAt: Date;
};
