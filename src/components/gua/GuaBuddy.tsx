import type { GameState } from './domain/types'

interface GuaBuddyProps {
  state: GameState
}

export function GuaBuddy({ state }: GuaBuddyProps) {
  const isBusy = state === 'casting' || state === 'revealing'
  const isHappy = state === 'result' || state === 'saved'
  const isError = state === 'error'

  return (
    <div
      className={`gua-buddy gua-buddy--${state}`}
      role="img"
      aria-label={isBusy ? '取象中' : isError ? '卦灵困惑' : isHappy ? '卦灵欢喜' : '卦灵静候'}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true">
        {/* body */}
        <ellipse cx="24" cy="30" rx="12" ry="10" />
        {/* ears */}
        <path d="M14 24 10 12l6 10" />
        <path d="m34 24 4-12-6 10" />
        {/* eyes */}
        {isBusy ? (
          <>
            <line x1="19" y1="28" x2="22" y2="28" />
            <line x1="26" y1="28" x2="29" y2="28" />
          </>
        ) : isError ? (
          <>
            <path d="m18 27 2 2m2-2-2 2" />
            <path d="m26 27 2 2m2-2-2 2" />
          </>
        ) : (
          <>
            <circle cx="20" cy="28" r="1.5" />
            <circle cx="28" cy="28" r="1.5" />
          </>
        )}
        {/* mouth */}
        <path d={isHappy ? 'M20 34q4 4 8 0' : 'M22 35h4'} />
        {/* feet */}
        <path d="M16 39c-2 1-3 2-3 3M32 39c2 1 3 2 3 3" />
      </svg>
    </div>
  )
}
