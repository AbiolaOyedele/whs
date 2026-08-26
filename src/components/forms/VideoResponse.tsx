/**
 * Optional video response step.
 *
 * Records in-browser with MediaRecorder where available, and always offers a
 * file-upload fallback. The camera stream is stopped on unmount and whenever
 * recording ends, so the indicator light never stays on after the user is done.
 *
 * NOTE: there is no upload endpoint yet — video storage was not in the confirmed
 * stack, so this deliberately stops at "recorded, ready to send" and flags the
 * gap. See docs/PROGRESS.md § F-10.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_SECONDS = 120

type Phase = 'idle' | 'ready' | 'recording' | 'recorded' | 'unsupported'

export default function VideoResponse() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | undefined>(undefined)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    window.clearInterval(timerRef.current)
  }, [])

  useEffect(() => stopStream, [stopStream])

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof MediaRecorder === 'undefined') {
      setPhase('unsupported')
    }
  }, [])

  const requestCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        await videoRef.current.play().catch(() => undefined)
      }
      setPhase('ready')
    } catch {
      setError(
        'We could not access your camera. You can upload a video file instead, using the option below.'
      )
      setPhase('unsupported')
    }
  }

  const startRecording = () => {
    const stream = streamRef.current
    if (!stream) return
    chunksRef.current = []
    const recorder = new MediaRecorder(stream)
    recorderRef.current = recorder

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      setPreviewUrl(URL.createObjectURL(blob))
      setPhase('recorded')
      stopStream()
    }

    recorder.start()
    setPhase('recording')
    setSeconds(0)
    timerRef.current = window.setInterval(() => {
      setSeconds((value) => {
        if (value + 1 >= MAX_SECONDS) {
          recorderRef.current?.stop()
          return MAX_SECONDS
        }
        return value + 1
      })
    }, 1000)
  }

  const stopRecording = () => recorderRef.current?.stop()

  const onFileChosen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    setPhase('recorded')
  }

  const buttonClass =
    'wh-tap inline-flex items-center justify-center rounded-full px-6 text-base font-medium transition-opacity'

  return (
    <div className="space-y-6">
      {phase !== 'unsupported' && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface-dark">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live camera preview, no track exists */}
          <video
            ref={videoRef}
            {...(previewUrl ? { src: previewUrl, controls: true } : {})}
            playsInline
            className="aspect-video w-full bg-black"
          />
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/5 px-4 py-3 text-sm"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {phase === 'idle' && (
          <button
            type="button"
            onClick={requestCamera}
            className={`${buttonClass} bg-primary text-primary-foreground hover:opacity-90`}
          >
            Turn on camera
          </button>
        )}

        {phase === 'ready' && (
          <button
            type="button"
            onClick={startRecording}
            className={`${buttonClass} bg-primary text-primary-foreground hover:opacity-90`}
          >
            Start recording
          </button>
        )}

        {phase === 'recording' && (
          <>
            <button
              type="button"
              onClick={stopRecording}
              className={`${buttonClass} border border-border hover:bg-muted`}
            >
              Stop recording
            </button>
            <p aria-live="polite" className="text-sm text-muted-foreground tabular-nums">
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')} / 2:00
            </p>
          </>
        )}

        {phase === 'recorded' && (
          <p role="status" className="text-sm text-muted-foreground">
            Recorded. Review it above, then continue.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-5">
        <label htmlFor="video-upload" className="block text-sm font-medium">
          Or upload a video file instead
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          Any common video format. This route always works, camera or not.
        </p>
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={onFileChosen}
          className="wh-tap mt-3 flex w-full items-center text-sm file:mr-4 file:min-h-11 file:rounded-full file:border-0 file:bg-card file:px-5 file:text-sm file:font-medium"
        />
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <a
          href="/careers/apply/video/thank-you"
          className={`${buttonClass} bg-primary text-primary-foreground hover:opacity-90`}
        >
          Finish application
        </a>
        <a
          href="/careers/apply/video/thank-you"
          className={`${buttonClass} border border-border hover:bg-muted`}
        >
          Skip this step
        </a>
      </div>

      <p className="text-xs text-muted-foreground">
        This step is optional and skipping it does not count against you.
      </p>
    </div>
  )
}
