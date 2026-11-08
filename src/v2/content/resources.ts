/**
 * The help centre: short guides to using the platform. Every fact comes from
 * the main app (its screens, `src/config/plans.ts`, the help topics in the
 * dashboard and `docs/`). If a detail is not certain, it is left out.
 */
import { site } from '@v2/config/site'
import type { IconName } from '@v2/components/ui/Icon'
import type { RichBlock } from '@v2/content/blog'

export interface HelpQuestion {
  q: string
  a: string
}

export interface HelpGuide {
  slug: string
  title: string
  /** ISO date the guide was last checked against the app. */
  date: string
  artSeed: number
  icon: IconName
  /** One or two sentences that answer the guide's question on their own. */
  lede: string
  body: RichBlock[]
  faqs: HelpQuestion[]
}

const CHECKED = '2026-11-07'

export const HELP_GUIDES: HelpGuide[] = [
  {
    slug: 'open-your-shop',
    title: 'Open your shop in four steps',
    date: CHECKED,
    artSeed: 11,
    icon: 'bag',
    lede: 'You need an email address, a bank account for your payouts and one product to add. Your shop is live the moment that first product is in.',
    body: [
      { type: 'h2', text: 'Step 1: Create your account' },
      {
        type: 'p',
        text: [
          'Sign up with your name, email address and a password, or with Google or Apple. ',
          { text: 'Open your account', href: site.signUpUrl },
          '.',
        ],
      },
      { type: 'h2', text: 'Step 2: Name your shop' },
      {
        type: 'p',
        text: [
          'Pick your shop’s name and its web address. The address works from the day you open. You can connect a domain you own later: see ',
          { text: 'use your own domain', href: '/resources/use-your-own-domain' },
          '.',
        ],
      },
      { type: 'h2', text: 'Step 3: Add your bank' },
      {
        type: 'p',
        text: 'Choose your bank and enter your account number. Paystack checks the name on the account. To change the account later, you enter a 6-digit code we email you. The code works for 10 minutes.',
      },
      {
        type: 'p',
        text: [
          'Only the shop owner can add or change the bank account. See ',
          { text: 'how payouts work', href: '/resources/how-payouts-work' },
          '.',
        ],
      },
      { type: 'h2', text: 'Step 4: Add products and share' },
      {
        type: 'p',
        text: 'A product needs a name, at least one picture, a price, and at least one size with a stock count. A size at zero still shows, marked sold out.',
      },
      {
        type: 'p',
        text: 'Once your first product is in, share your shop’s link in your Instagram bio, your WhatsApp status or a chat with a customer.',
      },
      { type: 'h3', text: 'Two faster ways to fill your shop' },
      {
        type: 'ul',
        items: [
          [
            { text: 'Set up with AI', strong: true },
            ': copy a prompt into ChatGPT or Claude, answer a few questions and paste the reply back in. It drafts your shop’s description and a starter product list.',
          ],
          [
            { text: 'Import from a website', strong: true },
            ': paste a link to a shop you already have online and it reads what it can from the page.',
          ],
        ],
      },
      {
        type: 'p',
        text: [
          'Either way, what it writes stays a draft until you press ',
          { text: 'Publish your changes', strong: true },
          '.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do I need a laptop?',
        a: 'No. Your shop and your dashboard work on a phone, from adding products to packing orders.',
      },
      {
        q: 'What does it cost to open?',
        a: 'Nothing. Every new shop gets a 7-day trial of Growth. If you do not choose a plan, your shop moves to Free, where there is no monthly fee and 3% comes off each online sale.',
      },
    ],
  },
  {
    slug: 'how-payouts-work',
    title: 'How payouts work',
    date: CHECKED,
    artSeed: 12,
    icon: 'bank',
    lede: 'Customers pay by card, bank transfer or USSD through Paystack. Paystack settles each sale to the bank account you added, usually the next working day.',
    body: [
      { type: 'h2', text: 'Where the money goes' },
      {
        type: 'p',
        text: 'Paystack takes the payment and pays it to your own bank account. It does not wait in a wallet with us first.',
      },
      { type: 'h2', text: 'What comes off each sale' },
      {
        type: 'ul',
        items: [
          [
            { text: 'Our fee', strong: true },
            ', which depends on your plan: 3% on Free, 1% on Starter, and nothing on Growth or Pro.',
          ],
          [
            { text: 'Paystack’s own charge', strong: true },
            '. Under Settings, then Payments, you choose who pays it: it comes off your share, or the customer pays it at checkout.',
          ],
        ],
      },
      { type: 'p', text: 'Each order in your dashboard shows the fee taken.' },
      { type: 'h2', text: 'Your bank details' },
      {
        type: 'p',
        text: 'Only the shop owner can add or change the payout account. Changing an account that is already connected needs a 6-digit code we email you, which works for 10 minutes. The full details go to Paystack to set up your payouts. We keep only the bank name, the account name and the last four digits.',
      },
      { type: 'h2', text: 'Refunds' },
      {
        type: 'p',
        text: 'The shop owner can refund an order from its page, in full or in part. A card payment taken through Paystack is refunded through Paystack. A sale paid in cash or by transfer is marked as refunded, and you return the money yourself.',
      },
      {
        type: 'p',
        text: 'Disputes and chargebacks are between you, your buyer and Paystack.',
      },
      { type: 'h2', text: 'Sales away from your website' },
      {
        type: 'p',
        text: [
          'A customer who scans your QR code pays through Paystack, the same as a website order. See ',
          { text: 'sell in person with a QR code', href: '/resources/sell-in-person-with-a-qr-code' },
          '. Cash, or a transfer straight to your account, is already yours: record the sale so your takings stay right.',
        ],
      },
    ],
    faqs: [
      {
        q: 'When do I get my money?',
        a: 'Paystack settles each sale to the bank account you added, usually the next working day.',
      },
      {
        q: 'Why is a payout less than the order total?',
        a: 'Our fee for your plan comes off, and so does Paystack’s own charge unless you pass it to the customer. Each order shows the fee taken.',
      },
      {
        q: 'Can my staff change the bank account?',
        a: 'No. Money settings stay with the shop owner.',
      },
    ],
  },
  {
    slug: 'choosing-a-plan',
    title: 'Choosing a plan',
    date: CHECKED,
    artSeed: 13,
    icon: 'chart',
    lede: 'Every plan has an online shop and checkout. The paid plans lower or remove the fee on each online sale and raise the limits.',
    body: [
      { type: 'h2', text: 'The plans' },
      {
        // Mirrors PLANS in the main app's src/config/plans.ts; change both together.
        type: 'table',
        caption: 'Prices are for one month, before 7.5% VAT.',
        head: ['Plan', 'Price a month', 'Fee on each online sale', 'Products', 'Staff', 'Written reports a month'],
        rows: [
          ['Free', '₦0', '3%', '25', 'Just you', '1'],
          ['Starter', '₦3,500', '1%', '300', '2', '1'],
          ['Growth', '₦9,000', 'None', 'Unlimited', '5', '5'],
          ['Pro', '₦20,000', 'None', 'Unlimited', 'Unlimited', '15'],
        ],
      },
      {
        type: 'ul',
        items: [
          'Email campaigns and your own domain come with Starter, Growth and Pro.',
          'The full business report comes with Growth and Pro.',
          'Priority support comes with Pro.',
          'Paystack’s own charge applies to card, transfer and USSD payments on every plan.',
        ],
      },
      { type: 'h2', text: 'Your first week' },
      {
        type: 'p',
        text: 'Every new shop gets a 7-day trial of Growth, so you can try everything before you choose.',
      },
      { type: 'h2', text: 'Which plan costs less' },
      {
        type: 'p',
        text: 'Starter costs less than Free once your online sales pass ₦175,000 a month, because 2% of ₦175,000 is ₦3,500. Growth costs less than Starter once they pass ₦550,000 a month. These sums leave out VAT and count only the fee on online sales.',
      },
      {
        type: 'p',
        text: 'Limits matter too. If you sell more than 25 products, or need someone to help run the shop, Free will not be enough.',
      },
      { type: 'h2', text: 'Paying for longer' },
      {
        type: 'p',
        text: 'Pay for 1, 3, 6 or 12 months at once. Paying for 3 months takes 5% off, 6 months 10% off and 12 months 20% off. VAT of 7.5% is added after the discount.',
      },
      {
        type: 'p',
        text: 'Plans are paid in advance and are not refunded for time you do not use.',
      },
      { type: 'h2', text: 'When a plan runs out' },
      {
        type: 'p',
        text: 'Your plan keeps working for 7 more days. After that your shop moves to Free. It is never switched off, and nothing is deleted.',
      },
    ],
    faqs: [
      {
        q: 'Is VAT included in the prices?',
        a: 'No. The prices are before 7.5% VAT, which is added when you pay.',
      },
      {
        q: 'Do I keep my shop if I stop paying?',
        a: 'Yes. Your plan keeps working for 7 more days, then the shop moves to Free. Nothing is deleted.',
      },
      {
        q: 'Will the prices change?',
        a: 'If we change our fees, we tell you by email at least 30 days before.',
      },
    ],
  },
  {
    slug: 'use-your-own-domain',
    title: 'Use your own domain',
    date: CHECKED,
    artSeed: 14,
    icon: 'globe',
    lede: 'Every shop gets its own web address to start. On Starter and above you can connect a domain you have bought, like yourshop.com.',
    body: [
      { type: 'h2', text: 'Before you start' },
      {
        type: 'ul',
        items: [
          'You need the Starter, Growth or Pro plan.',
          'Only the shop owner can connect a domain.',
          'Buy the domain first, from any domain seller. You will sign in there to change its DNS records.',
        ],
      },
      { type: 'h2', text: 'Connect it' },
      {
        type: 'ol',
        items: [
          [
            'In your dashboard, go to ',
            { text: 'Settings', strong: true },
            ', then ',
            { text: 'Your own domain', strong: true },
            '.',
          ],
          'Type the domain, like yourshop.com.',
          'Copy the two records shown: an A record for the domain itself, and a CNAME record for www.',
          'At your domain seller, add both records. Remove any other A record for @ and any other record for www.',
          ['Come back and press ', { text: 'Check now', strong: true }, '.'],
        ],
      },
      { type: 'h2', text: 'How long it takes' },
      {
        type: 'p',
        text: 'DNS changes can take a few minutes to a day to show. Until then, the check says the domain is not pointing here yet. Your shop switches over only when the records are right and the set-up on our side is finished.',
      },
      {
        type: 'p',
        text: [
          'When it says ',
          { text: 'Connected', strong: true },
          ', your shop opens on your own domain. To go back, press ',
          { text: 'Stop using this domain', strong: true },
          '.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do I have to buy the domain from you?',
        a: 'No. Buy it from any domain seller, then connect it from your dashboard.',
      },
      {
        q: 'It still says the domain is not pointing here. What now?',
        a: 'Give it up to a day. Check that both records match what the page shows, and that no other A record for @ or record for www is left.',
      },
    ],
  },
  {
    slug: 'sell-in-person-with-a-qr-code',
    title: 'Sell in person with a QR code',
    date: CHECKED,
    artSeed: 15,
    icon: 'qr',
    lede: 'Selling at a market, a pop-up or your stall? Make a code for the sale. Your customer scans it and pays on their own phone, and the order lands in your list.',
    body: [
      { type: 'h2', text: 'Make the code' },
      {
        type: 'ol',
        items: [
          [
            'Open ',
            { text: 'Sell in person', strong: true },
            '. It has its own button at the top of every dashboard page.',
          ],
          'Find each item by its name, or type the code on its label.',
          'If you agreed a lower price, take it off. Leave it at zero for the full price.',
          ['Press ', { text: 'Make the QR code', strong: true }, '.'],
        ],
      },
      { type: 'h2', text: 'Get paid' },
      {
        type: 'p',
        text: 'Show the code to your customer. They scan it and pay through Paystack on their own phone. If the code will not scan, send them the link shown under it instead.',
      },
      {
        type: 'p',
        text: 'Once they pay, the sale joins your orders as a walk-in sale, and your latest sales show on the same page.',
      },
      { type: 'h2', text: 'A code that stays on your stall' },
      {
        type: 'p',
        text: [
          'For a code to print on a sign or your packaging, use ',
          { text: 'QR codes', strong: true },
          ' under Analytics. Make a code, download it, and see how often it is scanned, at what time of day, and on what phones.',
        ],
      },
    ],
    faqs: [
      {
        q: 'The customer paid me cash. Do I still make a code?',
        a: 'No. The code is for paying through Paystack. For cash or a transfer to your account, record the sale by hand instead.',
      },
      {
        q: 'Do my wholesale prices apply?',
        a: 'No. When you sell in person, you set the price yourself.',
      },
    ],
  },
  {
    slug: 'record-whatsapp-sales',
    title: 'Record sales from WhatsApp and Instagram',
    date: CHECKED,
    artSeed: 16,
    icon: 'phone',
    lede: 'Orders you take in a chat or over the phone belong in the same list as your website orders. Record each one so your takings and customers stay in one place.',
    body: [
      { type: 'h2', text: 'Record a sale' },
      {
        type: 'ol',
        items: [
          ['On your dashboard home, press ', { text: 'Record a sale', strong: true }, '.'],
          'Pick the customer, or add a new one.',
          'Add the items they bought.',
          'Choose where the sale came from, such as WhatsApp, Instagram, phone or walk-in.',
          'Say how much they have paid: all of it, part of it or nothing yet, and how they paid.',
          'If the sale happened on an earlier day, change the order date.',
        ],
      },
      { type: 'h2', text: 'Collect what is still owed' },
      {
        type: 'p',
        text: [
          'Open the order and press ',
          { text: 'Request payment', strong: true },
          '. It makes a Paystack link for the balance. Send it in your WhatsApp chat or copy it anywhere, and it is emailed too when the customer has an email address. When they pay, the order is marked paid.',
        ],
      },
      {
        type: 'p',
        text: [
          { text: 'Copy customer link', strong: true },
          ' gives you a page for that order to send the customer.',
        ],
      },
      { type: 'h2', text: 'Points on recorded sales' },
      {
        type: 'p',
        text: [
          'If you give ',
          { text: 'loyalty points', href: '/resources/loyalty-points' },
          ' on recorded sales, the customer needs an email address on the sale to earn them.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I record a sale I made last week?',
        a: 'Yes. Change the order date when you record it.',
      },
      {
        q: 'Can the customer pay the rest later?',
        a: 'Yes. Record what they have paid, then send a payment link for the balance from the order.',
      },
    ],
  },
  {
    slug: 'delivery-with-fez',
    title: 'Deliver orders with Fez',
    date: CHECKED,
    artSeed: 17,
    icon: 'truck',
    lede: 'Set your own delivery fees for the areas you cover, or connect Fez. With Fez, each order is priced by weight and the delivery is booked once the order is paid.',
    body: [
      { type: 'h2', text: 'Your own delivery fees' },
      {
        type: 'p',
        text: 'On the Delivery page, add a fee and list the areas it covers, separated by commas: Lekki, Ajah, Ikoyi. You set one price for those areas, and shoppers in them see it at checkout.',
      },
      {
        type: 'p',
        text: 'You can also offer pickup, so a shopper collects the order and does not need to give an address.',
      },
      { type: 'h2', text: 'Connect Fez' },
      {
        type: 'ol',
        items: [
          'You need a Fez account. Only the shop owner can connect it.',
          'On the Delivery page, enter the details you sign in to Fez with.',
          'Choose Test while you try it, which collects nothing, or Live for real collections.',
          'Pick the state Fez collects from, and a weight per item for products with no weight of their own.',
        ],
      },
      {
        type: 'p',
        text: [
          'Give each product its parcel weight, under ',
          { text: 'More details', strong: true },
          ' on the product form, so Fez prices orders by their real weight.',
        ],
      },
      { type: 'h2', text: 'Once an order is paid' },
      {
        type: 'p',
        text: 'The delivery is booked with Fez for you. The order page shows the delivery and how to track it, and its status updates as Fez moves the parcel.',
      },
      { type: 'h2', text: 'Disconnecting' },
      {
        type: 'p',
        text: 'If you disconnect Fez, areas priced by Fez disappear from checkout until you connect again. Orders already booked are not affected.',
      },
    ],
    faqs: [
      {
        q: 'Can I use Fez and my own fees together?',
        a: 'Yes. Each delivery fee is either a price you set or priced by Fez, so you can deliver nearby yourself and use Fez further away.',
      },
      {
        q: 'Can I use another delivery company?',
        a: 'Not yet. Fez is the one delivery partner for now. You can still set your own fees and deliver any way you like.',
      },
    ],
  },
  {
    slug: 'discount-codes',
    title: 'Discount codes and automatic discounts',
    date: CHECKED,
    artSeed: 18,
    icon: 'sparkle',
    lede: 'Give shoppers a code to type at checkout, or set a discount that comes off on its own.',
    body: [
      { type: 'h2', text: 'Make a code' },
      {
        type: 'p',
        text: [
          'Under ',
          { text: 'Marketing', strong: true },
          ', open ',
          { text: 'Discounts', strong: true },
          ' and add a code. You choose:',
        ],
      },
      {
        type: 'ul',
        items: [
          'The code shoppers type. Letters and numbers, no spaces.',
          'A percentage off, or an amount off in naira.',
          'A smallest order it works on. Leave it at zero for any order.',
          'The most it can take off. Leave it blank for no cap.',
          'The day it stops working. Leave it blank to run until you turn it off.',
          'How many times it can be used. Leave it blank for no limit.',
        ],
      },
      { type: 'p', text: 'When you turn a code off, it stops working immediately.' },
      { type: 'h2', text: 'Automatic discounts' },
      {
        type: 'p',
        text: 'An automatic discount needs no code. Aim it at chosen products or collections, and limit it to one group of customers if you like. At checkout the best automatic discount comes off, unless the shopper types a code.',
      },
      { type: 'h2', text: 'Getting codes to customers' },
      {
        type: 'p',
        text: 'Put a code in your WhatsApp status, your newsletter, or an email campaign. Email campaigns come with Starter and above.',
      },
    ],
    faqs: [
      {
        q: 'Can a shopper use a code and an automatic discount together?',
        a: 'No. The best automatic discount comes off unless the shopper types a code. If they do, the code is used instead.',
      },
      {
        q: 'Where do shoppers type the code?',
        a: 'In the discount code box at checkout.',
      },
    ],
  },
  {
    slug: 'loyalty-points',
    title: 'Reward repeat customers with points',
    date: CHECKED,
    artSeed: 19,
    icon: 'box',
    lede: 'Customers earn points when they buy and spend them on a later order. You choose how many points a sale earns and what a point is worth.',
    body: [
      { type: 'h2', text: 'Set it up' },
      {
        type: 'p',
        text: ['Under ', { text: 'Marketing', strong: true }, ', open ', { text: 'Loyalty', strong: true }, '.'],
      },
      {
        type: 'ul',
        items: [
          'Give points on website orders, on sales you record, or both. Each has its own rule.',
          'Set how many naira a customer spends to earn one point, and what a point is worth when they spend it.',
          'Set the most points one order can earn, or leave it blank for no limit.',
          'Name your points whatever suits your shop.',
          'Choose whether unused points expire, after 6 months, 1 year or 2 years, counted from the customer’s last order or use of points.',
          'Choose whether to email customers about their unused points once a month.',
        ],
      },
      { type: 'h2', text: 'How customers earn and spend them' },
      {
        type: 'ul',
        items: [
          'Points are earned on paid orders, on what the goods cost after discounts.',
          'On your website, signed-in customers tick a box at checkout to use their points. They see their points on their account page.',
          'On a sale you record, add the points in the Record a sale form. The customer needs an email address on the sale to earn.',
          'If an order is cancelled or fully refunded, the points it earned are taken back and any points it used are returned.',
        ],
      },
      { type: 'h2', text: 'Check and correct' },
      {
        type: 'p',
        text: 'Open a customer to see their points, and correct them by hand if you need to.',
      },
    ],
    faqs: [
      {
        q: 'Who can use points at checkout?',
        a: 'Customers who are signed in to their account on your shop.',
      },
      {
        q: 'What happens to points if I refund an order?',
        a: 'On a full refund, the points the order earned are taken back and any points it used are returned.',
      },
    ],
  },
  {
    slug: 'wholesale-prices',
    title: 'Set wholesale prices',
    date: CHECKED,
    artSeed: 20,
    icon: 'shirt',
    lede: 'Charge less for each piece when a customer buys more. Your shop shows the lower prices, and checkout works them out.',
    body: [
      { type: 'h2', text: 'Add a price rule' },
      {
        type: 'p',
        text: [
          'Go to ',
          { text: 'Products', strong: true },
          ', then ',
          { text: 'Wholesale prices', strong: true },
          ', and add a price rule.',
        ],
      },
      {
        type: 'ul',
        items: [
          'Give it a name. The name is for you: shoppers see the prices, not the name.',
          'Choose what the price drops with: how many of one piece, how many pieces in the bag, or what the bag adds up to.',
          'Choose what it covers: every piece, chosen pieces or chosen collections.',
          'Add up to 6 price breaks, each a percentage off. For a rule on how many of one piece, you can set a price each instead.',
        ],
      },
      { type: 'h2', text: 'What shoppers see' },
      {
        type: 'ul',
        items: [
          'Buy more, pay less on the product page, with the price breaks.',
          'In the bag, the lower price on the line, and a note saying how many more to add for the next price.',
          'At checkout, a Wholesale prices line for rules on the whole bag.',
        ],
      },
      {
        type: 'p',
        text: 'Checkout works out every price again before payment, so the shopper pays what the rule says.',
      },
      { type: 'h2', text: 'How rules combine' },
      {
        type: 'p',
        text: 'Rules never stack. Each line in the bag gets the lowest price any one rule gives it. Extras keep their own price.',
      },
      { type: 'h2', text: 'Where they do not apply' },
      {
        type: 'p',
        text: 'Wholesale prices apply to orders on your website. When you sell in person or record a sale by hand, you set the price yourself.',
      },
    ],
    faqs: [
      {
        q: 'Can a product be in two rules?',
        a: 'Yes, but the rules do not add up. The line gets the lowest price either rule gives.',
      },
    ],
  },
]

/** Newest first; guides checked on the same day keep their order above. */
export function sortedGuides(): HelpGuide[] {
  return HELP_GUIDES.map((guide, index) => ({ guide, index }))
    .sort((a, b) => b.guide.date.localeCompare(a.guide.date) || a.index - b.index)
    .map(({ guide }) => guide)
}

export function guideBySlug(slug: string): HelpGuide | undefined {
  return HELP_GUIDES.find((guide) => guide.slug === slug)
}

/** The next guides in the list after `guide`, wrapping round to the start. */
export function relatedGuides(guide: HelpGuide, count = 3): HelpGuide[] {
  const all = sortedGuides()
  const start = all.findIndex((item) => item.slug === guide.slug)
  const related: HelpGuide[] = []
  for (let step = 1; step < all.length && related.length < count; step += 1) {
    const next = all[(start + step) % all.length]
    if (next) related.push(next)
  }
  return related
}

/** The byline on every guide. */
export const HELP_AUTHOR = { name: 'Help centre', role: `Written by the ${site.name} team` } as const

/** Shown at the foot of every guide. */
export const HELP_CTA = {
  title: `Open your shop on ${site.name}`,
  body: 'Start with a 7-day trial of Growth. After that, Free has no monthly fee until you choose a plan.',
  label: 'Open your shop',
  href: site.signUpUrl,
} as const
