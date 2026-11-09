/** Words for the llms.txt generator at /tools/llms-txt-generator. */
export const LLMS_TOOL = {
  meta: {
    title: 'llms.txt Generator',
    description: 'Generate an llms.txt index for any public website from its sitemap. Free, and nothing is stored.',
  },
  title: 'llms.txt Generator',
  intro: 'Point it at a website and it builds a Markdown index of the pages an AI assistant should read first.',
  label: 'Website or sitemap address',
  hint: 'Nothing is stored. Larger sites can take a few seconds.',
  submit: 'Generate llms.txt',
  emptyError: 'Enter the address of a website, such as https://example.com.',
  failed: 'We could not make a file for that address. Check it opens in your browser, then try again.',
  offline: 'We could not reach our server. Check your connection and try again.',
  found: (discovered: number, included: number) =>
    `Found ${discovered} pages and included the ${included} closest to the home page.`,
  steps: [
    {
      title: 'Find',
      body: 'We read your robots.txt, find your sitemaps, and follow any nested or zipped ones.',
    },
    {
      title: 'Choose',
      body: 'We take up to thirty of the pages closest to your home page, then read each one’s title and description.',
    },
    { title: 'Publish', body: 'Copy the Markdown and serve it at /llms.txt on your domain.' },
  ],
  explainer: {
    title: 'What is llms.txt?',
    body: 'llms.txt is a plain Markdown file at the root of a website listing its most important pages, each with a one-line description. It helps AI assistants find and cite the right pages instead of guessing from a crawl. It is not a search ranking signal and does not replace a sitemap: it sits alongside one.',
  },
} as const
