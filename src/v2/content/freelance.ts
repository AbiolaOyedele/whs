/**
 * Copy for /freelance-hub, carried over from the original site's Freelance Hub
 * page (src/pages/freelance-hub.astro, now retired). The application form's
 * fields and options live in ./forms.ts.
 */

export const FREELANCE_PAGE = {
  meta: {
    title: 'Freelance Hub',
    description:
      'Freelance with WildHands. Scoped briefs, direct client contact, no unpaid pitching, thirty-day payment terms.',
  },
  label: 'Freelance Hub',
  title: 'Work with us, not for us.',
  intro: 'Scoped briefs, direct client contact, and no unpaid pitching. Here is exactly how it runs.',
  applyCta: { label: 'Apply to the pool', href: '#apply' },
  benefitsTitle: 'Why people stay in the pool',
  benefits: [
    { title: 'Paid on time', body: 'Thirty-day terms, and we chase our clients so you do not have to chase us.' },
    { title: 'Scoped work', body: 'You get a written brief with an agreed definition of done, not a standing Slack channel.' },
    { title: 'No unpaid pitching', body: 'We do not ask freelancers to produce speculative work to win a project.' },
    {
      title: 'Direct client contact',
      body: 'You talk to the client. We do not put an account manager between you and the decision.',
    },
    { title: 'Repeat engagements', body: 'Most of our freelancers work with us across several projects rather than one.' },
    { title: 'Your own tools', body: 'We care that it is maintainable. Use whatever editor you like.' },
  ],
  processTitle: 'How it works',
  process: [
    { title: 'Apply', body: 'Send the form below with a portfolio we can actually look at.' },
    { title: 'Short call', body: 'Thirty minutes on what you like working on and what you avoid.' },
    { title: 'Into the pool', body: 'We match you against briefs as they come in.' },
    { title: 'First engagement', body: 'A written scope, an agreed rate, and a named point of contact.' },
  ],
  applyTitle: 'Apply',
  applyLead: 'One form. We read every one and reply either way.',
  form: {
    submit: 'Submit application',
    confirmations: 'Confirmations',
    successTitle: 'Application received',
    successAction: { label: 'Back to WildHands', href: '/' },
  },
  faqTitle: 'Freelance questions',
  faqs: [
    {
      question: 'How are freelance rates set?',
      answer:
        'You tell us your rate. We do not run reverse auctions and we do not ask people to undercut each other for a brief.',
    },
    {
      question: 'How much work can I expect?',
      answer:
        'It varies with the project pipeline and we will not pretend otherwise. Most people in the pool work with us in blocks rather than continuously.',
    },
    {
      question: 'Can I work with you part-time alongside other clients?',
      answer: 'Yes. Most of our freelancers do. We agree an hours-per-month baseline up front so both sides can plan.',
    },
    {
      question: 'What time zones do you work across?',
      answer:
        'We are async-first, so the overlap requirement is usually a couple of hours rather than a full working day.',
    },
    { question: 'How long does the application take to review?', answer: 'We aim to reply within a week either way.' },
  ],
  email: {
    title: 'Prefer to just email?',
    body: 'Send a portfolio link and a line about what you do.',
    address: 'hr@whstd.com',
  },
  newsletter: {
    title: 'Not ready to apply?',
    body: 'We email when new briefs open up. No more than monthly.',
  },
} as const
