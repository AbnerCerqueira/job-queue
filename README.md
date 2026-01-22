# Job Queue

Este é um **mini projeto** implementado em **Typescript**, usando **Node.js** e uma abordagem **event-driven**. O objetivo é demonstrar diferentes módulos do sistema reagirem a eventos usando comunicação assíncrona.

---

## Como funciona

### 1. **Abstração EventBus**

-   Interface com métodos `on`, `once`, `emit`, `off`
-   A implementação `NodeEventBus` sobre o módulo `events` do Node.js mapeia nomes de classes de eventos para strings de evento.
-   O `NodeEventBus` é implementado como singleton para centralizar a emissão de eventos.


### 2. **Fila de jobs event-driven**

-   A fila escuta eventos de novos jobs `NewJobEvent`.
-   Quando um job é adicionado, se a fila não estiver processando, inicia o processamento do primeiro job.
-   Jobs são processados sequencialmente, um de cada vez.

### 3. **Processamento assíncrono**

-   Cada job é enviado para processamento via `OrchestrateProcess.execute()`.
-   O processamento simula uma operação assíncrona.

### 4. **Eventos para conclusão**

-   Quando um job é finalizado, um evento `FinishJobEvent` é emitido.
-   A fila escuta esses eventos para marcar jobs como `DONE` e iniciar o próximo job.

### 5. **Timeout**

-   Cada job possui um timeout de 10 segundos.
-   Se o job não receber um evento de conclusão dentro desse tempo, é marcado como `FAILED` e a fila continua processando os próximos jobs.

### 6. **Idempotência**

-   Eventos de novos jobs verificam se o job já existe na fila.
-   Eventos de conclusão verificam se o job é o atual em processamento.

---

## Uso

### 1. Rodar

```bash
npm run build
npm run start
```

-   O script adiciona 3 jobs via eventos e simula a conclusão de alguns.
-   A fila processa os jobs sequencialmente, aplicando timeout se necessário.

### 2. Simulação

-   O código em `main.ts` emite eventos para adicionar jobs e finalizar alguns.
-   Jobs que não são finalizados manualmente atingem timeout e são marcados como FAILED.

---

## Conceitos que aprendi com essa demo

-   **Processamento sequencial** garantindo ordem.
-   **Controle de timeout** para jobs que não respondem.
-   **Arquitetura event-driven** desacoplada.
-   **Idempotência** em eventos.
-   **Singleton** para instância única.

---
