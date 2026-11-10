import { Icon } from '@v2/components/ui/Icon'

interface StepTickProps {
  done: boolean
  /** Spins a loader in the ring while this step is underway. */
  working?: boolean
}

/** An ink ring that fills and shows a tick when its step is done. */
export function StepTick({ done, working = false }: StepTickProps) {
  return (
    <span
      className={`relative flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-navy-900 motion-safe:transition-colors motion-safe:duration-300 ${
        done ? 'bg-navy-900 text-white' : 'bg-white text-navy-900'
      }`}
    >
      {working && !done ? (
        <Icon name="loaderCircle" strokeWidth={2.5} className="size-3.5 motion-safe:animate-spin" />
      ) : (
        <Icon
          name="check"
          strokeWidth={3}
          className={`size-3 motion-safe:transition-transform motion-safe:duration-300 ${done ? 'scale-100' : 'scale-0'}`}
        />
      )}
    </span>
  )
}
