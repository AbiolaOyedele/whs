/**
 * Resend client and send helper. The ONLY module permitted to touch the Resend
 * SDK — API routes call the form service, which calls in here.
 */
import { Resend } from 'resend'
import { serverEnv } from '@/config/env'
import { AppError } from './errors'

let client: Resend | null = null

/** Lazily constructs the Resend client so the key is read only when sending. */
function getClient(): Resend {
  if (client === null) client = new Resend(serverEnv().RESEND_API_KEY)
  return client
}

/** A file attached to an outgoing notification, e.g. an applicant's CV. */
export interface OutgoingAttachment {
  filename: string
  content: Buffer
}

export interface SendNotificationOptions {
  subject: string
  /** Plain-text body. Assembled from already-validated field values. */
  text: string
  /** Set so the team can reply straight to the applicant. */
  replyTo?: string
  attachments?: OutgoingAttachment[]
}

/**
 * Sends an internal notification to CONTACT_NOTIFICATION_EMAIL.
 * Throws AppError on transport failure — never surfaces the provider's message.
 */
export async function sendNotification(options: SendNotificationOptions): Promise<void> {
  const { CONTACT_NOTIFICATION_EMAIL } = serverEnv()

  try {
    const { error } = await getClient().emails.send({
      /*
       * Sent from theruff.agency, which is already verified on the same Resend
       * account. resend.dev only delivers to the account owner, which forced
       * notifications to an inbox that is not the one actually read.
       *
       * This address is NEVER client-visible: `to` below is hardcoded to
       * CONTACT_NOTIFICATION_EMAIL, so this function can only ever email us.
       * An enquirer's address is used as replyTo and nothing else.
       *
       * If the site ever needs to email a client directly (a confirmation, an
       * auto-reply), this From has to change first — a client must not see
       * another brand's domain. That needs whstd.com verified in Resend, which
       * needs an MX record at `send` that Namecheap cannot host alongside its
       * email forwarding. The route is moving DNS to Cloudflare. See
       * docs/PROGRESS.md § F-24.
       */
      from: 'WildHands <notifications@theruff.agency>',
      to: [CONTACT_NOTIFICATION_EMAIL],
      subject: options.subject,
      text: options.text,
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
      ...(options.attachments ? { attachments: options.attachments } : {}),
    })

    if (error) {
      throw new AppError(
        502,
        'We could not deliver your message just now. Please try again in a moment.',
        'EMAIL_SEND_PROVIDER_ERROR',
        error
      )
    }
  } catch (cause) {
    if (cause instanceof AppError) throw cause
    throw new AppError(
      502,
      'We could not deliver your message just now. Please try again in a moment.',
      'EMAIL_SEND_TRANSPORT_ERROR',
      cause
    )
  }
}
