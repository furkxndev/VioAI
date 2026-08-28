import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

/**
 * Açılış animasyonu: bir rota çizilir, üzerine duraklar düşer, ardından marka belirir.
 *
 * Sekme oturumunda bir kez oynar (`sessionStorage`). Her yenilemede görmek isterseniz
 * `PLAY_ONCE_PER_SESSION` değerini `false` yapın.
 */
const PLAY_ONCE_PER_SESSION = true
const SESSION_KEY = 'vioai:intro-played'

/** Animasyon bitip kapanmaya başlayana kadar geçen süre (ms). */
const HOLD_DURATION = 2600

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Duraklar bu eğrinin üzerindeki kübik segment uçlarıdır; eğri değişirse pinler de güncellenmeli. */
const ROUTE_PATH = 'M16 92C60 92 68 40 116 40C164 40 168 84 214 74C254 66 268 34 304 30'
const ROUTE_ORIGIN = { x: 16, y: 92 }
const PINS = [
  { x: 116, y: 40, delay: 0.62 },
  { x: 214, y: 74, delay: 0.82 },
  { x: 304, y: 30, delay: 1.02 },
]

const WORDMARK = ['V', 'i', 'o']

const readPlayed = (): boolean => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

const writePlayed = (): void => {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    // gizli sekmede sessionStorage erişimi hata verebilir; animasyonun oynamasına engel değil
  }
}

export const IntroAnimation = () => {
  const prefersReducedMotion = useReducedMotion()
  const [isDismissed, setIsDismissed] = useState(() => PLAY_ONCE_PER_SESSION && readPlayed())

  // Render sırasında türetilir: useReducedMotion ilk render'da null dönüp sonradan
  // çözülürse animasyon bir effect'e gerek kalmadan kendiliğinden kapanır.
  const isVisible = !isDismissed && !prefersReducedMotion

  const dismiss = useCallback(() => {
    setIsDismissed(true)
    writePlayed()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const timer = window.setTimeout(dismiss, HOLD_DURATION)
    const onKeyDown = () => dismiss()

    window.addEventListener('keydown', onKeyDown)

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [dismiss, isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="intro"
          role="presentation"
          aria-hidden
          onClick={dismiss}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden bg-ink-900"
        >
          {/* zemin ışıması */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 50% at 50% 45%, rgb(109 74 255 / 0.30) 0%, transparent 70%)',
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: EASE }}
          />

          {/* çizilen rota */}
          <svg
            viewBox="0 0 320 120"
            fill="none"
            className="relative w-[19rem] max-w-[82vw] sm:w-[22rem]"
          >
            <defs>
              <linearGradient id="intro-route" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b6dff" />
                <stop offset="0.6" stopColor="#6d4aff" />
                <stop offset="1" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* soluk iz */}
            <path
              d={ROUTE_PATH}
              stroke="#ffffff"
              strokeOpacity="0.08"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <motion.path
              d={ROUTE_PATH}
              stroke="url(#intro-route)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.15, ease: EASE, delay: 0.15 }}
            />

            {/* başlangıç noktası */}
            <motion.circle
              cx={ROUTE_ORIGIN.x}
              cy={ROUTE_ORIGIN.y}
              r="4.5"
              fill="#ffffff"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: EASE, delay: 0.2 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />

            {PINS.map((pin) => (
              <motion.g
                key={`${pin.x}-${pin.y}`}
                initial={{ scale: 0, y: -14, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 22, delay: pin.delay }}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              >
                <circle cx={pin.x} cy={pin.y} r="9" fill="#6d4aff" fillOpacity="0.28" />
                <circle cx={pin.x} cy={pin.y} r="5" fill="#ffffff" />
              </motion.g>
            ))}
          </svg>

          {/* marka */}
          <div className="relative mt-9 flex items-center gap-3">
            <motion.span
              className="gradient-brand flex size-12 items-center justify-center rounded-2xl text-xl font-black text-white shadow-glow"
              initial={{ scale: 0.4, opacity: 0, rotate: -14 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 1.15 }}
            >
              V
            </motion.span>

            <span className="flex text-3xl leading-none font-extrabold tracking-tight text-white sm:text-4xl">
              {WORDMARK.map((letter, index) => (
                <motion.span
                  key={letter}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 1.32 + index * 0.06 }}
                >
                  {letter}
                </motion.span>
              ))}
              <motion.span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(120deg, #ad98ff, #ffb59f)' }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 1.32 + WORDMARK.length * 0.06 }}
              >
                AI
              </motion.span>
            </span>
          </div>

          <motion.p
            className="relative mt-4 px-6 text-center text-sm text-white/60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 1.7 }}
          >
            Şehri size göre planlayan rota hazırlanıyor
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
