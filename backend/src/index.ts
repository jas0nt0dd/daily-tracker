import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logger } from './lib/logger.js';
import { healthRouter } from './routes/health.js';
import { meRouter } from './routes/me.js';
import { insightsRouter } from './routes/insights.js';
import { exportsRouter } from './routes/exports.js';
import { notificationsRouter, jobsRouter } from './routes/notifications.js';

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));

// Generous but real rate limiting on the API surface; /health is exempt.
const apiLimiter = rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false });
app.use('/api', apiLimiter);

app.use(healthRouter);
app.use(meRouter);
app.use(insightsRouter);
app.use(exportsRouter);
app.use(notificationsRouter);
app.use(jobsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`Daily Life OS backend listening on port ${env.PORT}`);
});
