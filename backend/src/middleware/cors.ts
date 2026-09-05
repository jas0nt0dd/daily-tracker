import cors from 'cors';
import { allowedOrigins } from '../config/env.js';

// Never falls back to "*" in production — only explicitly configured
// frontend origins are allowed (see CORS in the product spec).
export const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
});
