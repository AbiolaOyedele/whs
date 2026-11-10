import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { SplitText } from 'gsap/SplitText'

let registered = false

/** GSAP with the plugins this site uses, registered once on the client. */
export function getGsap(): typeof gsap {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(Flip, SplitText)
    registered = true
  }
  return gsap
}

export { Flip, SplitText }

/** False when the visitor asked their system for less motion. */
export function motionAllowed(): boolean {
  return typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** True on touch screens, where hover effects never run. */
export function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
}
