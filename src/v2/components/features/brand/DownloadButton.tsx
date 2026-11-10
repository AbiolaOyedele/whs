import { Icon } from '@v2/components/ui/Icon'

interface DownloadButtonProps {
  label: string
  href: string
  className?: string
}

/**
 * The tall navy download button from the brand page: the site button's
 * hover (fill grows in) in ink, with a download icon.
 */
export function DownloadButton({ label, href, className = '' }: DownloadButtonProps) {
  return (
    <a
      href={href}
      className={`button group bg-charcoal relative isolate inline-flex min-h-15 items-center justify-center gap-2 overflow-hidden rounded-sm px-3.5 text-white md:px-5 ${className}`}
    >
      <span
        aria-hidden="true"
        className="bg-navy-900 pointer-events-none absolute inset-0 -z-10 [transform:scale3d(0.9,0.7,1)] rounded-[inherit] opacity-0 transition-[transform,opacity] duration-200 ease-(--ease) group-hover:[transform:scale3d(1,1,1)] group-hover:opacity-100"
      />
      <span className="text-label z-2 inline-block leading-none">{label}</span>
      <span
        className="pointer-events-none relative inline-flex items-center justify-center"
        aria-hidden="true"
      >
        <Icon name="download" className="size-6.5" />
      </span>
    </a>
  )
}
