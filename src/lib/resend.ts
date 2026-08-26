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
       * TODO(B-5): switch to `WildHands <hello@whstd.com>` once whstd.com is
       * verified in Resend (DNS: SPF, DKIM). Deliberately NOT switched yet —
       * sending from an unverified domain fails outright, which would take
       * every form on the site down. resend.dev works today; the swap is a
       * one-line change after the DNS records land.
       */
      from: 'WildHands <onboarding@resend.dev>',
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
