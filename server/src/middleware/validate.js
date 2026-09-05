/**
 * Runs a zod schema against a request segment and replaces it with the parsed
 * (whitelisted, coerced) value so controllers never see raw client input.
 */
export const validate =
  (schema, segment = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[segment]);
    if (!result.success) {
      const err = new Error('Validation failed');
      err.status = 400;
      err.name = 'ZodError';
      err.issues = result.error.issues;
      return next(err);
    }
    // req.query is a getter in Express 5-ish setups; assign defensively.
    try {
      req[segment] = result.data;
    } catch {
      req.validated = { ...(req.validated || {}), [segment]: result.data };
    }
    next();
  };
