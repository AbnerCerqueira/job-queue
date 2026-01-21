import pino from 'pino';

export const pinoPretty = {
  target: 'pino-pretty',
  options: {
    colorize: true,
  },
};

export const loggerConfig = {
  level: 'info',
  transport: {
    targets: [pinoPretty],
  },
  base: null,
  timestamp: pino.stdTimeFunctions.isoTime,
  messageKey: 'message',
};

export const logger = pino(loggerConfig);
