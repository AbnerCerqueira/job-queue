import type { Job } from './job';

export interface OrchestrateProcess {
  execute(job: Job): Promise<void>;
}

export class ExampleOrchestrateProcess implements OrchestrateProcess {
  public async execute(job: Job): Promise<void> {
    await this.sendJob(job);
  }

  private async sendJob(_job: Job) {
    // simula operação de chamar serviço externo
  }
}
