/**
 * Application error type and API error formatting.
 *
 * `lib/` services throw AppError for expected failures. API routes catch and
 * format with `toErrorResponse`, which never leaks `details` or a stack trace
 * to the client.
 */

/** Error code format: DOMAIN_ACTION_REASON. */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    /** Plain English. Shown directly to the user — no codes, no jargon. */
    public override message: string,
    /** DOMAIN_ACTION_REASON, e.g. FORM_CONTACT_INVALID_INPUT. */
    public code: string,
    /** Internal diagnostics only. Never serialised to the client. */
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/** Type guard narrowing an unknown caught value to AppError. */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/** The only error shape the client ever receives. */
export interface ApiErrorBody {
  error: {
    code: string
    message: string
  }
}

/** Successful API response body. */
export interface ApiSuccessBody {
  ok: true
  message: string
}

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

/**
 * Serialises a caught value into a safe JSON Response.
 * Unknown errors collapse to a generic 500 so internals never escape.
 */
export function toErrorResponse(error: unknown): Response {
  if (isAppError(error)) {
    const body: ApiErrorBody = { error: { code: error.code, message: error.message } }
    return new Response(JSON.stringify(body), { status: error.statusCode, headers: JSON_HEADERS })
  }

  // Log the real cause server-side, return nothing useful to an attacker.
  console.error('[unhandled]', error)
  const body: ApiErrorBody = {
    error: {
      code: 'SERVER_REQUEST_FAILED',
      message: 'Something on our end stopped this from going through. Please try again shortly.',
    },
  }
  return new Response(JSON.stringify(body), { status: 500, headers: JSON_HEADERS })
}

/** Serialises a success payload into a JSON Response. */
export function toSuccessResponse(message: string, status = 200): Response {
  const body: ApiSuccessBody = { ok: true, message }
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS })
}
