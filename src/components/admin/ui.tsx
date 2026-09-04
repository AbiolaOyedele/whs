/**
 * Admin form primitives.
 *
 * Separate from `components/forms/form-primitives.tsx`, which is tuned for the
 * public marketing forms (hairline underlines, 20px type, generous spacing).
 * The admin is a dense working tool used for long stretches, so these are
 * compact, bordered and high-contrast. Sharing one component and branching on a
 * variant would leave both jobs done at half strength.
 *
 * Every control clears 44px regardless of density — the mobile-first floor is
 * not something an internal tool gets to opt out of.
 */
import type { ChangeEvent, ReactNode, Ref } from 'react'
import { useId, useState } from 'react'
import { Icon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

const CONTROL =
  'w-full min-h-11 rounded-xl border border-border bg-card px-3 py-2 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-foreground disabled:opacity-50'

/** Applied on top of CONTROL when the server rejected this field. */
const CONTROL_INVALID = 'border-destructive bg-destructive/5 focus-visible:border-destructive'

interface FieldProps {
  label: string
  hint?: string | undefined
  error?: string | undefined
  required?: boolean | undefined
  children: (id: string, describedBy: string | undefined) => ReactNode
}

/** Label, control, hint and error, wired together for assistive tech. */
export function Field({ label, hint, error, required, children }: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
        {!required && <span className="ml-1 text-muted-foreground/60">(optional)</span>}
      </label>
      {children(id, describedBy)}
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

interface TextProps {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string | undefined
  error?: string | undefined
  required?: boolean | undefined
  placeholder?: string | undefined
  type?: 'text' | 'email' | 'url' | 'date'
  maxLength?: number | undefined
  /**
   * The Zod path this control maps to, e.g. `lineItems.3.unitPriceMinor`.
   * Rendered as `data-field` so a failed save can scroll straight to it.
   */
  dataField?: string | undefined
}

export function TextInput({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  placeholder,
  type = 'text',
  maxLength,
  dataField,
}: TextProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(id, describedBy) => (
        <input
          id={id}
          type={type}
          value={value}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          data-field={dataField}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
          className={cn(CONTROL, error && CONTROL_INVALID)}
        />
      )}
    </Field>
  )
}

export function TextArea({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  placeholder,
  rows = 4,
  maxLength,
  dataField,
}: TextProps & { rows?: number }) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(id, describedBy) => (
        <textarea
          id={id}
          value={value}
          rows={rows}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          data-field={dataField}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
          className={cn(CONTROL, 'resize-y leading-relaxed', error && CONTROL_INVALID)}
        />
      )}
    </Field>
  )
}

/*
 * `Select` lives in ./Select.tsx — a button-plus-listbox, not a native
 * <select>. Re-exported here so call sites keep one import for the primitives.
 * See that file for why the native control is not used anywhere, admin included.
 */
export { Select, type SelectOption } from './Select'

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    // The label is the hit target, which is what makes a 20px box clear 44px.
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 shrink-0 accent-[var(--accent)]"
      />
      {label}
    </label>
  )
}

/*
 * Four tones, and only these four.
 *
 * `danger` is the quiet one: an outline, for a destructive action sitting in a
 * list beside non-destructive ones, where a row of solid red reads as an alarm.
 * `dangerSolid` is the loud one, for the confirm button of a dialog that has
 * already asked "are you sure?" and needs the answer to look like a decision.
 * The dialog used to hand-roll it inline, which left two different solid reds
 * in one product.
 */
type ButtonTone = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerSolid'

const TONES: Record<ButtonTone, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground',
  secondary: 'border border-border bg-card text-foreground hover:border-foreground',
  ghost: 'text-muted-foreground hover:text-foreground',
  danger: 'border border-destructive/40 text-destructive hover:bg-destructive/10',
  /* Darkens the fill on hover and never the label: fading a button dims its
     text along with its background, which drops contrast at the exact moment
     the user is committing to the action. */
  dangerSolid:
    'border border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90',
}

export function Button({
  children,
  onClick,
  tone = 'secondary',
  type = 'button',
  disabled,
  className,
  ref,
}: {
  children: ReactNode
  onClick?: () => void
  tone?: ButtonTone
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  /** For dialogs, which must move focus to their own confirm button on open. */
  ref?: Ref<HTMLButtonElement>
}) {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-base transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        TONES[tone],
        className
      )}
    >
      {children}
    </button>
  )
}

/** A titled block. The unit the editor is built from, so nothing runs together. */
export function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string | undefined
  action?: ReactNode | undefined
  children: ReactNode
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl leading-tight">{title}</h2>
          {description && <p className="mt-1 text-base text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Non-blocking status line. `role="status"` so changes are announced. */
export function StatusLine({
  tone,
  children,
}: {
  tone: 'idle' | 'error' | 'success'
  children: ReactNode
}) {
  if (!children) return null
  return (
    <p
      role="status"
      className={cn(
        'text-sm',
        tone === 'error' && 'text-destructive',
        tone === 'success' && 'text-foreground',
        tone === 'idle' && 'text-muted-foreground'
      )}
    >
      {children}
    </p>
  )
}

/**
 * One row of a repeated collection, collapsed to a summary until opened.
 *
 * A quote with three packages, thirteen lines and four phases is several
 * screens of open form fields, and the operator is looking for one of them.
 * Collapsed, the same quote is a list they can scan.
 *
 * The row's controls (reorder, remove) sit OUTSIDE the disclosure button
 * rather than inside it: a button inside a button is invalid HTML, and every
 * browser resolves it by dropping one of them — usually the one you needed.
 */
export function CollapsibleRow({
  label,
  title,
  meta,
  actions,
  defaultOpen = false,
  children,
}: {
  /** The row's kind and position, e.g. "Package 1". Always visible. */
  label: string
  /** What this row is. Falls back to a prompt when the row is still blank. */
  title: string
  /** A figure or short qualifier shown on the right when collapsed. */
  meta?: string | undefined
  actions?: ReactNode
  /** New rows open on mount — a blank row is useless collapsed. */
  defaultOpen?: boolean | undefined
  children: ReactNode
}) {
  const id = useId()
  const [open, setOpen] = useState(defaultOpen)

  return (
    <li className="rounded-2xl border border-border">
      <div className="flex items-center gap-2 pr-2 pl-4">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={id}
          className="flex min-h-14 flex-1 items-center gap-3 text-left outline-none focus-visible:underline"
        >
          <Icon
            name="chevronDown"
            className={cn(
              'size-3 shrink-0 text-muted-foreground transition-transform',
              open && 'rotate-180'
            )}
          />
          <span className="shrink-0 font-mono text-sm text-muted-foreground">{label}</span>
          <span
            className={cn('min-w-0 flex-1 truncate', !title && 'text-muted-foreground/60 italic')}
          >
            {title || 'Untitled'}
          </span>
          {meta && <span className="shrink-0 font-mono text-sm text-muted-foreground">{meta}</span>}
        </button>
        {actions && <div className="flex shrink-0 items-center">{actions}</div>}
      </div>

      {/* Unmounted rather than hidden: these bodies hold form controls, and a
          hidden-but-present control is still focusable, still submitted, and
          still counted by assistive tech. */}
      {open && (
        <div id={id} className="border-t border-border p-4">
          {children}
        </div>
      )}
    </li>
  )
}
