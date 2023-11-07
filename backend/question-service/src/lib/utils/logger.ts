import dotenv from "dotenv";
import pino from 'pino';

dotenv.config();

export function createLogger(prefix: string) {
    return pino({
        level: process.env.LOG_LEVEL || 'debug',
        msgPrefix: `[${prefix}] `,
    });
}

const logger = createLogger('question-service');
export default logger