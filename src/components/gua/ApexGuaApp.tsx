import { useState } from 'react'
import {
  appendLineToCastSession,
  finalizeCastSession,
  startCast,
} from './domain/cast-session'
import { getCastResult } from './domain/cast-result'
import { castOneLine } from './domain/random'
import { deleteSavedCast, loadSavedCasts, saveCast } from './lib/saved-casts'
import type {
  CastMethod,
  CastResultViewModel,
  CastSession,
  GameState,
  LineValue,
  SavedCast,
} from './domain/types'
import { GuaBuddy } from './GuaBuddy'
import { HexagramResultCard } from './HexagramResultCard'
import { LineStack } from './LineStack'
import { SavedCastList } from './SavedCastList'
import './apex-gua.css'

export interface ApexGuaAppProps {
  castLine?: (method: CastMethod) => LineValue
}

const LINE_STATES: GameState[] = [
  'line_1_done',
  'line_2_done',
  'line_3_done',
  'line_4_done',
  'line_5_done',
  'line_6_done',
]

const PROGRESS_COPY = [
  '静心取象，一卦即成。',
  '初爻起于下，象事之始。',
  '二爻已落，内卦渐明。',
  '内卦已成。',
  '外卦初启。',
  '五爻已定，静候上爻。',
  '六爻既成，卦象已现。',
]

export function ApexGuaApp({
  castLine = castOneLine,
}: ApexGuaAppProps) {
  const [method, setMethod] = useState<CastMethod>('yarrow')
  const [state, setState] = useState<GameState>('idle')
  const [session, setSession] = useState<CastSession | null>(null)
  const [result, setResult] = useState<CastResultViewModel | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [savedCasts, setSavedCasts] = useState<SavedCast[]>(() => loadSavedCasts())
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lines = session?.line_values ?? []
  const isBusy = state === 'casting' || state === 'revealing'

  const handleCast = () => {
    if (isBusy || lines.length >= 6 || result) return

    setState('casting')
    setError(null)

    try {
      const activeSession = session ?? startCast(method)
      const nextSession = appendLineToCastSession(activeSession, castLine(method))
      const lineCount = nextSession.line_values.length
      setSession(nextSession)
      setState(LINE_STATES[lineCount - 1])

      if (lineCount === 6) {
        setState('revealing')
        const record = finalizeCastSession(nextSession)
        setResult(getCastResult(record))
        setState('result')
      }
    } catch {
      setError('卦象未成，资料库未能匹配。请检查起卦数据。')
      setState('error')
    }
  }

  const handleRestart = () => {
    setSession(null)
    setResult(null)
    setIsSaved(false)
    setError(null)
    setState('idle')
  }

  const handleSave = () => {
    if (!result) return
    try {
      setSavedCasts(saveCast(result))
      setIsSaved(true)
      setState('saved')
    } catch (storageError) {
      setError(storageError instanceof Error ? storageError.message : '卦匣暂时无法使用')
    }
  }

  const handleDeleteSaved = (id: string) => {
    setSavedCasts(deleteSavedCast(id))
  }

  return (
    <div className="apex-gua-embedded">
    <main className="apex-gua-inner">
      <header className="app-header">
        <div className="app-header__title">
          <GuaBuddy state={state} />
          <div>
            <h1>Apex 算一卦</h1>
            <p>六次轻触，逐爻成卦</p>
          </div>
        </div>
      </header>

      {result ? (
        <HexagramResultCard
          result={result}
          isSaved={isSaved}
          onSave={handleSave}
          onRestart={handleRestart}
        />
      ) : (
      <section className="casting-stage" aria-label="起卦区">
        <div className="method-toggle" aria-label="选择起卦方法">
          <button
            className={method === 'yarrow' ? 'is-active' : ''}
            type="button"
            aria-pressed={method === 'yarrow'}
            disabled={lines.length > 0 || isBusy}
            onClick={() => setMethod('yarrow')}
          >
            大衍蓍法
          </button>
          <button
            className={method === 'coins' ? 'is-active' : ''}
            type="button"
            aria-pressed={method === 'coins'}
            disabled={lines.length > 0 || isBusy}
            onClick={() => setMethod('coins')}
          >
            铜钱速卜
          </button>
        </div>

        <div className="cast-panel">
          <p className="cast-progress" aria-live="polite">{lines.length} / 6 爻</p>
          <p className="cast-message" aria-live="polite">{isBusy ? '取象中……' : PROGRESS_COPY[lines.length]}</p>
          <LineStack lines={lines} />
          <button
            className="cast-button"
            type="button"
            aria-label={lines.length === 0 ? '起一卦' : '再取一爻'}
            disabled={isBusy}
            onClick={handleCast}
          >
            {isBusy ? '取象中' : lines.length === 0 ? '起一卦' : '再取一爻'}
          </button>
          {error && <p className="error-message" role="alert">{error}</p>}
        </div>
      </section>
      )}
      <footer className="widget-footer">
        <button className="archive-trigger" type="button" aria-label="打开卦匣" onClick={() => setArchiveOpen(true)}>
          卦匣 <small>{savedCasts.length}</small>
        </button>
      </footer>
      {archiveOpen && (
        <SavedCastList
          casts={savedCasts}
          onClose={() => setArchiveOpen(false)}
          onDelete={handleDeleteSaved}
        />
      )}
    </main>
    </div>
  )
}
