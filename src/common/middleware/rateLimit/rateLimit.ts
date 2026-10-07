type RateLimitRequest = {
  ip?: string;
  socket?: { remoteAddress?: string };
};

type RateLimitResponse = {
  status: (code: number) => RateLimitResponse;
  json: (body: unknown) => unknown;
  setHeader: (name: string, value: string) => void;
};

type RateLimitOptions = {
  windowMs: number;
  max?: number;
  limit?: number;
  message: unknown;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
};

function rateLimit(options: RateLimitOptions) {
  const requests = new Map<string, { count: number; resetAt: number }>();
  const limit = options.limit ?? options.max ?? 100;

  return (req: RateLimitRequest, res: RateLimitResponse, next: () => void) => {
    const key = req.ip ?? req.socket?.remoteAddress ?? "unknown";
    const now = Date.now();
    let entry = requests.get(key);

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + options.windowMs };
      requests.set(key, entry);
    }

    entry.count += 1;
    const remaining = Math.max(0, limit - entry.count);

    if (options.standardHeaders) {
      res.setHeader("RateLimit-Limit", String(limit));
      res.setHeader("RateLimit-Remaining", String(remaining));
      res.setHeader("RateLimit-Reset", String(Math.ceil((entry.resetAt - now) / 1000)));
    }

    if (entry.count > limit) return res.status(429).json(options.message);
    next();
  };
}

export const loginRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 1 minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const changePasswordRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many password change attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const sendOtpRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after 1 minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
