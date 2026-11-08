/**
 * The platform's privacy policy and terms of service, ported word for word
 * from the main app (`src/app/(platform)/privacy/page.tsx` and
 * `src/app/(platform)/terms/page.tsx`). When the wording changes there,
 * change it here too, along with `updated`.
 */
import { site } from '@v2/config/site'
import type { RichBlock } from '@v2/content/blog'

export interface LegalDocument {
  title: string
  description: string
  /** ISO date the wording last changed. */
  updated: string
  /** Shown under the title, beside the body on a wide screen. */
  intro: RichBlock[]
  body: RichBlock[]
}

const name = site.name

/** The contact line the main app adds to the foot of every policy page. */
const CONTACT: RichBlock[] = [
  { type: 'h2', text: 'Contact us' },
  {
    type: 'p',
    text: [
      'Questions about this page can go to ',
      { text: site.supportEmail, href: `mailto:${site.supportEmail}` },
      '. We reply within 30 days, and usually much sooner.',
    ],
  },
]

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  description: `How ${name} collects, uses and protects your personal data.`,
  updated: '2026-11-04',
  intro: [
    {
      type: 'p',
      text: `${name} lets anyone open an online shop. This policy explains what personal data we collect, why, and what you can do about it. We handle personal data in line with the Nigeria Data Protection Act 2023.`,
    },
  ],
  body: [
    { type: 'h2', text: 'Who is responsible' },
    {
      type: 'ul',
      items: [
        [
          { text: 'If you open a shop', strong: true },
          ` (a seller), ${name} decides how your account data is used, so we are responsible for it.`,
        ],
        [
          { text: 'If you buy from a shop', strong: true },
          `, the shop is responsible for your data. ${name} only stores and processes it on the shop’s behalf, to run the shop for them. Each shop has its own privacy policy, linked at the foot of its pages.`,
        ],
      ],
    },
    { type: 'h2', text: 'What we collect from sellers' },
    {
      type: 'ul',
      items: [
        [
          { text: 'Account details', strong: true },
          ': your name and email address. If you sign in with Google, Google shares your name, email address and profile picture with us, and nothing else. If you use a password, we never see it in readable form.',
        ],
        [
          { text: 'Shop details', strong: true },
          ': your shop’s name, web address, logo, description, products and anything else you add to your shop.',
        ],
        [
          { text: 'Payout details', strong: true },
          ': the bank name, account name and account number you give us to receive your money. These are passed to Paystack to set up your payouts. We keep only the bank name, account name and the last four digits.',
        ],
        [
          { text: 'How you use the dashboard', strong: true },
          ': a record of changes made to your shop and who made them, so you and your team can see what happened.',
        ],
        [
          { text: 'Technical data', strong: true },
          ': pages viewed and rough location, used to keep the service working and spot abuse. We count visitors with a code that changes every day, so nobody can be followed from one day to the next.',
        ],
      ],
    },
    { type: 'h2', text: 'What we process for shops' },
    {
      type: 'p',
      text: 'To run a shop, we store its orders and customers: names, email addresses, phone numbers, delivery addresses, what was bought, and unfinished orders. We send the shop’s order emails and reminders. We use this only to run that shop, never for ourselves, and we never share one shop’s customers with another.',
    },
    { type: 'h2', text: 'Why we use it' },
    {
      type: 'p',
      text: 'To create and run your account and shop, to pay out your sales, to send you messages about your shop, to keep the service safe and working, to answer you when you get in touch, and to meet our legal, tax and accounting duties. We do not sell personal data, and we do not use it for advertising.',
    },
    { type: 'h2', text: 'Who we share it with' },
    { type: 'p', text: 'Only the suppliers that help us run the service, and only what each one needs:' },
    {
      type: 'ul',
      items: [
        [{ text: 'Supabase', strong: true }, ': stores account, shop and order data, and handles sign-in.'],
        [{ text: 'Vercel', strong: true }, ': hosts the website.'],
        [
          { text: 'Paystack', strong: true },
          ': takes card payments and pays sellers out. Card numbers never reach our servers.',
        ],
        [{ text: 'Cloudinary', strong: true }, ': stores and serves product photos and logos.'],
        [{ text: 'Resend', strong: true }, ': sends emails.'],
        [
          { text: 'Fez Delivery', strong: true },
          ': when a shop books delivery, the name, address and phone number needed to deliver.',
        ],
        [{ text: 'Google', strong: true }, ': only if you choose to sign in with Google.'],
      ],
    },
    {
      type: 'p',
      text: 'Some of these suppliers store data outside Nigeria. Each one protects it under its own security and data-protection terms. We may also share data where the law requires it.',
    },
    { type: 'h2', text: 'Cookies' },
    {
      type: 'p',
      text: 'We use cookies only to keep you signed in and to remember your bag. We use no advertising or tracking cookies of our own. A shop may add its own marketing tools; its cookie policy explains them, and they load only if you agree.',
    },
    { type: 'h2', text: 'How long we keep it' },
    {
      type: 'p',
      text: 'Account and shop data is kept while your account is open. When you close it, we delete it within 90 days, except order and payment records, which we keep for six years to meet Nigerian tax and accounting rules. Unfinished orders are deleted after 30 days.',
    },
    { type: 'h2', text: 'Your rights' },
    {
      type: 'p',
      text: 'You can ask for a copy of your data, ask us to correct it or delete it, object to how we use it, or ask us to send it to someone else. Write to us and we will respond within 30 days. If you bought from a shop, you can also ask the shop directly. If you are not satisfied, you can complain to the Nigeria Data Protection Commission.',
    },
    { type: 'h2', text: 'Keeping it safe' },
    {
      type: 'p',
      text: 'Data is encrypted in transit, each shop can only ever see its own data, access is limited to the people who need it, and payment card details never touch our systems. If a breach ever affects you, we will tell you.',
    },
    { type: 'h2', text: 'Children' },
    { type: 'p', text: `${name} is not meant for anyone under 18, and we do not knowingly collect their data.` },
    { type: 'h2', text: 'Changes' },
    {
      type: 'p',
      text: [
        'If we change this policy, we will update the date at the top. If the change matters, we will tell sellers by email first. See also our ',
        { text: 'Terms of Service', href: '/terms-of-service' },
        '.',
      ],
    },
    ...CONTACT,
  ],
}

// Fees, trial and grace mirror PLANS, TRIAL_DAYS and GRACE_DAYS in the main app's src/config/plans.ts.
export const TERMS_OF_SERVICE: LegalDocument = {
  title: 'Terms of Service',
  description: `The terms for opening and running a shop on ${name}.`,
  updated: '2026-11-04',
  intro: [
    {
      type: 'p',
      text: [
        `These terms are an agreement between you and ${name} when you open or run a shop on ${name}. By creating an account, you agree to them. Please read them with our `,
        { text: 'Privacy Policy', href: '/privacy' },
        '.',
      ],
    },
  ],
  body: [
    { type: 'h2', text: 'Your account' },
    {
      type: 'ul',
      items: [
        'You must be at least 18 and able to enter a contract under Nigerian law.',
        'Give us true details and keep them up to date.',
        'Keep your sign-in safe. You are responsible for what happens in your account, including what team members you add do in it.',
      ],
    },
    { type: 'h2', text: 'Your shop' },
    {
      type: 'ul',
      items: [
        'Your shop is your business. You are the seller to your customers, and you are responsible for your products, prices, descriptions, delivery, refunds and customer service, and for following the law, including consumer, tax and data-protection rules.',
        `You keep ownership of everything you add: products, photos, words and logos. You give ${name} permission to store and show them only to run your shop and the service.`,
        'Your shop must have its own refund, delivery and privacy terms for your buyers. We give you starting versions you can change.',
      ],
    },
    { type: 'h2', text: 'What you may not sell or do' },
    {
      type: 'ul',
      items: [
        'Illegal, stolen, fake or counterfeit goods, weapons, drugs, or anything Paystack does not allow.',
        'Anything that misleads or defrauds buyers, or infringes someone else’s rights.',
        'Attacking, overloading or trying to get around the security of the service, or reaching another shop’s data.',
        'Sending spam through the service.',
      ],
    },
    { type: 'h2', text: 'Payments and fees' },
    {
      type: 'ul',
      items: [
        'Card payments are taken by Paystack and paid straight to your bank account. By taking payments you also agree to Paystack’s terms.',
        `On the Free plan ${name} keeps 3% of each online payment, on Starter 1%, and nothing on Growth or Pro, unless we agree a different rate with you in writing. Each order in your dashboard shows the fee taken. Paystack’s own fee is also taken from your share, unless you choose to pass it to your buyers.`,
        'Paid plans are paid in advance for 1, 3, 6 or 12 months, plus 7.5% VAT, and are not refunded for time not used. New shops get a 7-day trial of Growth. If a plan is not renewed, it keeps working for 7 more days, then the shop moves to Free: nothing is deleted.',
        'If we change our fees, we will tell you by email at least 30 days before. Refunds and chargebacks are between you, your buyer and Paystack.',
      ],
    },
    { type: 'h2', text: 'The service' },
    {
      type: 'ul',
      items: [
        `We work hard to keep ${name} running and your data safe, but we cannot promise it will never go down or have mistakes. We provide it as it is.`,
        'We may change, add or remove features. If a change takes away something you rely on, we will tell you first.',
        'We may suspend or close a shop that breaks these terms or puts buyers or the service at risk. Where we can, we will tell you why and give you a chance to fix it first.',
      ],
    },
    { type: 'h2', text: 'Closing your shop' },
    {
      type: 'p',
      text: `You can stop using ${name} at any time by writing to us. You can download your products, orders and customers before you go. Money already on its way to you will still be paid out.`,
    },
    { type: 'h2', text: 'Limits on our responsibility' },
    {
      type: 'p',
      text: `As far as the law allows, ${name} is not responsible for lost profits, lost data or indirect losses, or for disputes between you and your buyers. Our total responsibility to you is limited to the fees you paid us in the 12 months before the claim. Nothing here limits any right you have that the law says cannot be limited.`,
    },
    { type: 'h2', text: 'The law that applies' },
    {
      type: 'p',
      text: 'These terms are governed by the laws of the Federal Republic of Nigeria. If we disagree, we will first try to settle it by talking. If that fails, the courts of Nigeria will decide.',
    },
    { type: 'h2', text: 'Changes to these terms' },
    {
      type: 'p',
      text: `We may update these terms. We will change the date at the top, and tell you by email before any important change takes effect. If you keep using ${name} after that, you accept the new terms.`,
    },
    ...CONTACT,
  ],
}
