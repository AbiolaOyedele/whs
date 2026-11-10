'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from '@v2/components/ui/Icon'

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
      <span aria-hidden="true" className="mb-6 flex size-10 items-center justify-center rounded-full bg-pink-500 text-navy-900">
        <Icon name="check" strokeWidth={2.2} className="size-5" />
      </span>
      <h2 ref={heading} tabIndex={-1} className="text-heading-xs outline-none">
        {title}
      </h2>
      <p className="text-body-md mt-3 max-w-160 text-navy-900">{message}</p>
      {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
    </div>
  )
}
