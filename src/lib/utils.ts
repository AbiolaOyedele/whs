/**
 * Class-name helper used by the UI components.
 *
 * `clsx` resolves conditionals, `twMerge` resolves Tailwind conflicts so a later
 * class wins over an earlier one (e.g. `px-2` passed by a caller beats `px-4`
 * baked into a component's base classes).
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merges class names, de-duplicating conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
