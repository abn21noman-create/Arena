// ===================================================================
// Production Logger — Structured logging for production
// -------------------------------------------------------------------
// এই logger production-grade structured logging প্রদান করে।
// 
// Features:
//   - JSON structured output (Sentry/CloudWatch/Datadog compatible)
//   - Log levels (debug, info, warn, error, fatal)
//   - Request context (requestId, userId, route)
//   - Error tracking with stack traces
//   - Performance timing
//   - PII redaction (passwords, tokens)
//   - Dev mode: human-readable; Prod mode: JSON
// ===================================================================

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

interface LogContext {
  requestId?: string;
  userId?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  service: string;
  env: string;
}

const SERVICE_NAME = "hsc-ultimate";
const ENV = process.env.NODE_ENV || "development";
const IS_DEV = ENV === "development";

// PII keys to redact (case-insensitive)
const PII_KEYS = new Set([
  "password",
  "passwd",
  "token",
  "secret",
  "apikey",
  "api_key",
  "authorization",
  "cookie",
  "session",
  "creditcard",
  "credit_card",
  "ssn",
  "social",
]);

function redactPII(obj: unknown, depth = 0): unknown {
  if (depth > 5) return obj;
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => redactPII(item, depth + 1));
  }
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (PII_KEYS.has(key.toLowerCase())) {
      redacted[key] = "[REDACTED]";
    } else {
      redacted[key] = redactPII(value, depth + 1);
    }
  }
  return redacted;
}

function formatEntry(entry: LogEntry): string {
  if (IS_DEV) {
    // Human-readable for dev
    const time = new Date(entry.timestamp).toLocaleTimeString();
    const levelEmoji: Record<LogLevel, string> = {
      debug: "🔍",
      info: "ℹ️ ",
      warn: "⚠️ ",
      error: "❌",
      fatal: "💀",
    };
    let msg = `${levelEmoji[entry.level]} [${time}] ${entry.message}`;
    if (entry.context && Object.keys(entry.context).length > 0) {
      msg += ` ${JSON.stringify(redactPII(entry.context))}`;
    }
    if (entry.error) {
      msg += `\n  ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        msg += `\n${entry.error.stack}`;
      }
    }
    return msg;
  }
  // JSON for production
  return JSON.stringify(redactPII(entry));
}

function log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    service: SERVICE_NAME,
    env: ENV,
  };
  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  const formatted = formatEntry(entry);
  // Choose stream based on level
  if (level === "error" || level === "fatal") {
    console.error(formatted);
  } else if (level === "warn") {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (IS_DEV) log("debug", message, context);
  },
  info(message: string, context?: LogContext) {
    log("info", message, context);
  },
  warn(message: string, context?: LogContext) {
    log("warn", message, context);
  },
  error(message: string, context?: LogContext, error?: Error) {
    log("error", message, context, error);
  },
  fatal(message: string, context?: LogContext, error?: Error) {
    log("fatal", message, context, error);
  },

  // ───────────────────────────────────────────
  // Specialized helpers
  // ───────────────────────────────────────────

  /** Log an API request with timing */
  request(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    userId?: string
  ) {
    const level: LogLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    log(level, `${method} ${path} ${statusCode}`, {
      method,
      path,
      statusCode,
      durationMs,
      userId,
    });
  },

  /** Log an external API call (Groq, Mistral, etc.) */
  externalApi(
    provider: string,
    operation: string,
    durationMs: number,
    success: boolean,
    error?: Error
  ) {
    const level: LogLevel = success ? "info" : "error";
    log(level, `${provider} ${operation} ${success ? "ok" : "failed"}`, {
      provider,
      operation,
      durationMs,
    }, error);
  },

  /** Log a database operation */
  db(operation: string, model: string, durationMs: number, rowCount?: number) {
    log("debug", `DB ${operation} on ${model}`, {
      dbOperation: operation,
      model,
      durationMs,
      rowCount,
    });
  },

  /** Log security event (login, ban, etc.) */
  security(event: string, context: LogContext) {
    log("warn", `SECURITY: ${event}`, context);
  },

  /** Time a function execution */
  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      return await fn();
    } finally {
      const duration = Date.now() - start;
      log("debug", `${label} took ${duration}ms`, { label, durationMs: duration });
    }
  },
};

// ───────────────────────────────────────────
// Express-style request middleware helper
// ───────────────────────────────────────────
export function withRequestLogging(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const start = Date.now();
    const url = new URL(req.url);
    const method = req.method;
    const path = url.pathname;
    const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
    try {
      const response = await handler(req);
      const duration = Date.now() - start;
      logger.request(method, path, response.status, duration);
      // Add request ID to response
      response.headers.set("x-request-id", requestId);
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`${method} ${path} threw`, { method, path, durationMs: duration },
        error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };
}

export default logger;
