/**
 * WildHands' privacy policy and terms, ported word for word from the main
 * site: the privacy policy from `src/pages/legal/privacy-policy.astro`, and
 * the terms from `STANDARD_TERMS` and `STANDARD_PAYMENT_TERMS` in
 * `src/config/terms.ts`, the standard terms every quote carries. When the
 * wording changes there, change it here too, along with `updated`.
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
const email = site.supportEmail
const mailto = `mailto:${email}`

/** The contact line at the foot of the privacy policy. */
const CONTACT: RichBlock[] = [
  { type: 'h2', text: 'Contact' },
  {
    type: 'p',
    text: [
      'Email ',
      { text: email, href: mailto },
      ' for anything on this page: questions, corrections, deletions, or complaints.',
    ],
  },
]

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  description: `What ${name} collects, why, how long we keep it, and how to get it deleted.`,
  updated: '2026-08-27',
  intro: [
    { type: 'h2', text: 'The short version' },
    {
      type: 'ul',
      items: [
        'We collect what you type into our forms, and nothing else unless you accept analytics.',
        'We do not run a database of you. Submissions arrive as email; a CV is also filed privately so we can read it again.',
        'We do not sell your data, and we do not use it for advertising.',
        'The site sets no cookies at all until you make a choice in the banner.',
        ['Email ', { text: email, href: mailto }, ' and we will delete everything we hold about you.'],
      ],
    },
  ],
  body: [
    { type: 'h2', text: 'Who we are' },
    {
      type: 'p',
      text: `${name} is the data controller for the personal data described on this page. That means we decide what is collected and why, and we are responsible for looking after it.`,
    },
    {
      type: 'p',
      text: [
        'For anything about this policy, or to exercise any of the rights below, email ',
        { text: email, href: mailto },
        '. A person reads that address.',
      ],
    },
    { type: 'h2', text: 'What we collect' },
    { type: 'p', text: 'There are only four ways we end up with your personal data.' },
    {
      type: 'ul',
      items: [
        [
          { text: 'You contact us.', strong: true },
          ' Your name, email address, your phone number if you give one, what you write about your project, and how you heard about us if you tell us.',
        ],
        [
          { text: 'You apply to work with us.', strong: true },
          ' Your name and contact details, links to your professional profiles, your CV, and your answers to the application questions. Freelance applications also ask where you are resident for tax, what you are available for, and how many hours a month you want. Your CV is also stored as a private file so we can read it again during the process; everything else stays in the email.',
        ],
        [{ text: 'You subscribe to the freelance newsletter.', strong: true }, ' Your email address.'],
        [
          { text: 'You accept analytics.', strong: true },
          ' Which pages you visited, roughly where in the world you are, and what browser you used. Analytics do not load unless you accept them.',
        ],
      ],
    },
    {
      type: 'p',
      text: 'We do not ask for anything sensitive, and we would rather you did not send it. Please do not put health information, financial details or identity documents into a form on this site.',
    },
    { type: 'h2', text: 'Why we collect it, and our lawful basis' },
    {
      type: 'p',
      text: 'Under the UK GDPR we have to have a lawful basis for each thing we do with your data. Here is ours, in full.',
    },
    {
      type: 'table',
      caption: 'Our lawful basis for each use of your data',
      head: ['What we do', 'What that uses', 'Lawful basis', 'Why that one'],
      rows: [
        [
          'Replying to an enquiry you send us',
          'Name, email, phone, what you write',
          'Legitimate interests',
          'You contacted us about working together, and you expect a reply.',
        ],
        [
          'Assessing a job or freelance application',
          'Name, contact details, profile links, CV, your answers',
          'Steps prior to a contract',
          'We cannot consider you for work without reading what you sent.',
        ],
        [
          'Keeping an application on file for future roles',
          'The same application',
          'Consent',
          'Only if you tick the box. You can withdraw it at any time.',
        ],
        [
          'Sending the freelance newsletter',
          'Email address',
          'Consent',
          'You asked for it, and you can tell us to stop at any time.',
        ],
        [
          'Understanding which pages are useful',
          'Page views, browser and country',
          'Consent',
          'Analytics stay switched off unless you accept them.',
        ],
      ],
    },
    {
      type: 'p',
      text: 'Where we rely on legitimate interests, we have weighed our interest in running the business against your privacy. Replying to an enquiry you chose to send us is not something we think you would object to. If you disagree, you can object. See your rights below.',
    },
    { type: 'h2', text: 'How long we keep it' },
    {
      type: 'p',
      text: 'Form submissions arrive as email rather than going into a database, so deletion means removing the message and its attachments from our mailbox, and, for an application, deleting the stored copy of the CV. These are the periods we work to.',
    },
    {
      type: 'table',
      caption: 'How long we keep each kind of data',
      head: ['What', 'How long'],
      rows: [
        ['Enquiries sent through the contact form', '24 months from your last message to us'],
        ['Applications for a role we advertised', '12 months from the decision'],
        ['Applications you asked us to keep on file', '24 months, then we ask again or delete'],
        ['CVs, stored as private files', 'Deleted with the application they arrived with'],
        ['Newsletter subscriptions', 'Until you unsubscribe'],
        ['Analytics', '12 months, then aggregated'],
      ],
    },
    {
      type: 'p',
      text: 'If a project starts, the enquiry stops being an enquiry and becomes part of the client record, which we keep for as long as the law requires us to keep business records. Ask us and we will tell you exactly what we still hold.',
    },
    { type: 'h2', text: 'Who else touches it' },
    {
      type: 'p',
      text: 'Four companies process data on our behalf. Each is bound by a contract that limits them to acting on our instructions.',
    },
    {
      type: 'ul',
      items: [
        [
          { text: 'Resend', strong: true },
          ' delivers every form submission to us by email, including any CV you attach. Without Resend, the form does not reach anyone.',
        ],
        [
          { text: 'Cloudinary', strong: true },
          ' stores CVs sent with an application. They are kept as private files, not on a public address. Reaching one needs a signed link that we generate and that expires.',
        ],
        [{ text: 'PostHog', strong: true }, ' processes analytics, and only if you accept them.'],
        [
          { text: 'Vercel', strong: true },
          ' hosts the site and serves every page. Its access logs record IP addresses for a short period as part of running the infrastructure.',
        ],
      ],
    },
    {
      type: 'p',
      text: 'Nobody else gets your data. We do not sell it, we do not trade it, and we do not hand it to advertisers. We would disclose it if a court or the law required us to, and we would tell you unless we were forbidden from doing so.',
    },
    { type: 'h2', text: 'Where it goes' },
    {
      type: 'p',
      text: 'Our providers operate internationally, so your data may be processed outside the UK and the EEA, in practice in the United States. Where that happens it is covered by the UK International Data Transfer Addendum and the EU Standard Contractual Clauses, which are the safeguards the law provides for exactly this. You can ask us for a copy of the relevant terms.',
    },
    { type: 'h2', text: 'Cookies, and what we store in your browser' },
    {
      type: 'p',
      text: [
        { text: 'This site sets no cookies.', strong: true },
        ' Nothing at all is stored in your browser until you choose Accept or Decline in the banner.',
      ],
    },
    {
      type: 'ul',
      items: [
        [
          { text: 'Your choice.', strong: true },
          ' We save it in your browser’s local storage so we do not ask again on every page. Nothing about it is sent to us.',
        ],
        [
          { text: 'If you accept analytics,', strong: true },
          ' PostHog stores an identifier in local storage so that a returning visitor is not counted as a new person. It is switched off entirely if you decline, and it never loads before you decide.',
        ],
      ],
    },
    {
      type: 'p',
      text: 'Analytics here are deliberately narrow. We record page views. We do not record clicks, keystrokes, form contents, or session replays.',
    },
    {
      type: 'p',
      text: 'To change your mind, clear this site’s data in your browser settings. The banner will appear again on your next visit and you can choose differently.',
    },
    { type: 'h2', text: 'Keeping it safe' },
    {
      type: 'p',
      text: 'The site is served only over HTTPS. Form endpoints are rate-limited to make abuse expensive, which involves holding your IP address briefly in memory. It is never written to disk and never sent anywhere. Uploaded CVs are checked by file type and size and renamed on our side, so a filename can never be used to attack our systems. A stored CV is uploaded as a private file, not a public one, so it has no address anyone can guess. Reaching it needs a signed link that expires. Access to the mailbox holding enquiries is limited to the people who need it, and protected by two-factor authentication.',
    },
    {
      type: 'p',
      text: 'No system is perfect. If we ever suffer a breach that puts you at risk, we will tell the Information Commissioner’s Office within 72 hours and tell you without undue delay.',
    },
    { type: 'h2', text: 'Your rights' },
    { type: 'p', text: 'You can ask us to do any of the following, free of charge.' },
    {
      type: 'ul',
      items: [
        [{ text: 'See it.', strong: true }, ' Get a copy of everything we hold about you.'],
        [{ text: 'Fix it.', strong: true }, ' Correct anything that is wrong or incomplete.'],
        [{ text: 'Delete it.', strong: true }, ' Have it erased where we have no overriding reason to keep it.'],
        [{ text: 'Limit it.', strong: true }, ' Have us pause using it while a dispute is sorted out.'],
        [{ text: 'Object to it.', strong: true }, ' Tell us to stop, where we are relying on legitimate interests.'],
        [{ text: 'Move it.', strong: true }, ' Get it in a portable format, or have us send it somewhere else.'],
        [
          { text: 'Withdraw consent.', strong: true },
          ' Where consent is the basis, you can take it back at any time. That does not undo anything we did lawfully beforehand.',
        ],
      ],
    },
    {
      type: 'p',
      text: [
        'Email ',
        { text: email, href: mailto },
        '. We will reply within one month. We may ask you to confirm who you are first, so that we do not hand your data to somebody else.',
      ],
    },
    { type: 'h2', text: 'If you are unhappy' },
    {
      type: 'p',
      text: [
        'Please tell us first, because most things are quicker to fix directly. If we do not put it right, you have the right to complain to the UK’s data protection regulator, the ',
        { text: 'Information Commissioner’s Office', href: 'https://ico.org.uk/make-a-complaint/' },
        '. Complaining to them does not affect your right to a legal remedy.',
      ],
    },
    {
      type: 'p',
      text: 'If you are in the EEA, you can also complain to the supervisory authority where you live or work.',
    },
    { type: 'h2', text: 'Children' },
    {
      type: 'p',
      text: 'This site is aimed at businesses and at people looking for professional work. It is not intended for anyone under 16, and we do not knowingly collect their data. If you believe a child has sent us something, email us and we will delete it.',
    },
    { type: 'h2', text: 'Changes to this policy' },
    {
      type: 'p',
      text: [
        'When we change how we handle data, we update this page and move the date at the top. If a change matters to you, such as a new processor or a new purpose, we will say so clearly here rather than burying it. See also our ',
        { text: 'Terms of Service', href: '/terms-of-service' },
        '.',
      ],
    },
    ...CONTACT,
  ],
}

export const TERMS_OF_SERVICE: LegalDocument = {
  title: 'Terms of Service',
  description: `The standard terms that come with every ${name} quote: what is included, what counts as a revision, and what happens when something changes.`,
  updated: '2026-09-03',
  intro: [
    {
      type: 'p',
      text: [
        `These are the standard terms that come with every ${name} quote. Where they say “above”, they mean the quote they arrive with: its breakdown, its timeline and its payment terms. Please read them with our `,
        { text: 'Privacy Policy', href: '/privacy' },
        '.',
      ],
    },
  ],
  body: [
    { type: 'h2', text: 'What is included' },
    {
      type: 'p',
      text: 'Everything listed in the breakdown above, built to the scope agreed at the start. Each phase includes two rounds of revisions, and 30 days of support after handover for anything that is not working as described.',
    },
    { type: 'h2', text: 'Revisions' },
    {
      type: 'p',
      text: 'A revision is a change to something we have already built, within the agreed scope: copy, layout, spacing, colour, wording, or fixing something that does not behave as specified. Revisions are included, two rounds per phase. Rounds are consolidated feedback, not individual requests, so gather your comments and send them together.',
    },
    { type: 'h2', text: 'Work beyond the agreed scope' },
    {
      type: 'p',
      text: 'Three things are not revisions, and each is quoted separately before any work starts:',
    },
    {
      type: 'p',
      text: 'A rebuild is replacing something already approved and built with a different approach. If a page or a screen is signed off and then needs to be built again a different way, that is new work.',
    },
    {
      type: 'p',
      text: 'A redesign is changing the visual direction after it has been approved. Exploring alternatives before sign-off is part of the design phase; changing direction afterwards is not.',
    },
    {
      type: 'p',
      text: 'A new feature is anything not in the breakdown above. If it is not listed, it has not been priced.',
    },
    {
      type: 'p',
      text: 'We will always tell you before work becomes chargeable, and you will have a written price before we start. Nothing gets built that you have not agreed.',
    },
    { type: 'h2', text: 'What we need from you' },
    {
      type: 'p',
      text: 'Timely feedback, and access to whatever the work depends on: accounts, test environments, content, and the people who can approve things. We work to the timeline above on the basis of feedback within five working days at each sign-off point. If that slips, the timeline moves with it.',
    },
    { type: 'h2', text: 'Third-party costs' },
    {
      type: 'p',
      text: 'Hosting, domains, API fees, licences and identity checks are billed to you directly at cost, or passed on without markup. We will tell you what these are before you commit to anything.',
    },
    { type: 'h2', text: 'Payment' },
    {
      type: 'p',
      text: 'As set out above. Work begins once the deposit clears. Invoices are payable within the terms stated on the invoice.',
    },
    {
      type: 'p',
      text: 'Unless your quote says otherwise: 50% to start, 50% on handover. Invoices are payable within 14 days. Work begins once the deposit clears.',
    },
    { type: 'h2', text: 'If something changes' },
    {
      type: 'p',
      text: 'Either side can pause or stop the work. You pay for what has been done up to that point, and you keep it: designs, code and content produced so far are yours.',
    },
  ],
}
