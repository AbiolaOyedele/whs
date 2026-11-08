'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface FormSuccessProps {
  title: string
  message: string
  /** Buttons or links under the message. */
  children?: ReactNode
}

/**
 * Replaces a form once the server has accepted it. Focus moves to the heading
 * so a screen reader announces it, and keyboard users are not left on a button
 * that no longer exists.
 */
export function FormSuccess({ title, message, children }: FormSuccessProps) {
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    heading.current?.focus()
  }, [])

  return (
    <div role="status" className="anim-fade-slide-in rounded-lg bg-white p-fluid-md text-navy-900 md:p-fluid-lg">
      <svg className="mb-6 size-10 text-navy-900" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="20" className="fill-pink-500" />
        <path d="M12.5 20.5 17.5 25.5 28 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h2 ref={heading} tabIndex={-1} className="text-heading-xs outline-none">
        {title}
      </h2>
      <p className="text-body-md mt-3 max-w-160 text-navy-500">{message}</p>
      {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
    </div>
  )
}
