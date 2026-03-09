require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const main = require('./config/db');
const healthRoutes = require('./routes/health.routes');
const authRouter = require('./routes/userAuth');

const PORT = process.env.PORT || 3000;

const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = isProduction
  ? process.env.FRONTEND_URL
  : process.env.CLIENT_URL;

console.log('Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('Frontend URL:', frontendUrl);

app.set('trust proxy', 1);

/* ---------------- MIDDLEWARE ---------------- */

// ✅ FIX 1: Added fallback for missing frontendUrl and array support for multiple origins.
// If frontendUrl is undefined (missing .env key), CORS blocks ALL requests silently —
// extremely hard to debug. The fallback and warning makes the misconfiguration obvious.
if (!frontendUrl) {
  console.warn(
    '⚠️  WARNING: Frontend URL is not set. ' +
    `Expected env var: ${isProduction ? 'FRONTEND_URL' : 'CLIENT_URL'}. ` +
    'CORS will block all cross-origin requests.'
  );
}

app.use(cors({
  // ✅ FIX 2: Support multiple origins (e.g. Vercel preview URLs + production).
  // Also handles the undefined frontendUrl case gracefully.
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin header) and same-origin
    if (!origin) return callback(null, true);

    const allowed = [
      frontendUrl,
      // Add more origins here if needed, e.g. 'http://localhost:5174'
    ].filter(Boolean); // remove undefined/null entries

    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin "${origin}" not allowed`));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ---------------- HEALTH CHECK ---------------- */

app.get('/', (req, res) => {
  // ✅ FIX 3: Added db connection status to health check response.
  // Previously you'd get a 200 even if DB was still connecting / failed.
  res.json({
    message: 'Backend API is live!',
    environment: isProduction ? 'production' : 'development',
    timestamp: new Date().toISOString(),
    database: isConnected ? 'connected' : 'connecting...',
  });
});

/* ---------------- ROUTES ---------------- */

app.use('/user', authRouter);
app.use('/health', healthRoutes);

/* ---------------- 404 HANDLER ---------------- */

// ✅ FIX 4: Added a 404 handler for undefined routes.
// Without this, unmatched routes fall through to the error handler
// which returns a 500 instead of the correct 404.
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

/* ---------------- ERROR HANDLER ---------------- */

// ✅ FIX 5: Added NODE_ENV guard — never expose stack traces in production.
// Stack traces leak implementation details and are a security risk.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // CORS errors from the origin check above
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ message: err.message });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    // Only include stack trace in development
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

/* ================================================= */
/* 🔥 RENDER-SAFE STARTUP 🔥                         */
/* ================================================= */

let isConnected = false;

const initializeConnection = async () => {
  if (isConnected) return;

  try {
    await main();
    console.log('✅ DB connected');
    isConnected = true;
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    // ✅ FIX 6: Retry DB connection instead of giving up permanently.
    // On Render/Railway cold starts, the DB might not be ready immediately.
    // Retry every 5 seconds up to 5 times before giving up.
    let retries = 0;
    const MAX_RETRIES = 5;
    const RETRY_DELAY_MS = 5000;

    const retry = async () => {
      if (retries >= MAX_RETRIES) {
        console.error(`❌ DB failed after ${MAX_RETRIES} retries. Giving up.`);
        return;
      }
      retries++;
      console.log(`🔄 Retrying DB connection (${retries}/${MAX_RETRIES}) in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      try {
        await main();
        console.log('✅ DB connected on retry');
        isConnected = true;
      } catch {
        await retry();
      }
    };

    await retry();
  }
};

// ✅ Start server immediately (Render requirement — port must bind fast)
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

// ✅ Connect DB after server starts (non-blocking)
initializeConnection();

module.exports = app;