import type { CastResultViewModel } from './domain/types'
import { GuaBuddy } from './GuaBuddy'
import { LineStack } from './LineStack'

interface HexagramResultCardProps {
  result: CastResultViewModel
  isSaved: boolean
  onSave: () => void
  onRestart: () => void
}

export function HexagramResultCard({
  result,
  isSaved,
  onSave,
  onRestart,
}: HexagramResultCardProps) {
  const {
    baseHexagram,
    changedHexagram,
    changingLineLabels,
    lowerTrigram,
    record,
    upperTrigram,
    weather,
  } = result

  return (
    <section className="result-screen" aria-label="揭卦结果">
      <div className="result-scroll">
        <div className="result-heading">
          <h2>{baseHexagram.name} {baseHexagram.unicode}</h2>
          <GuaBuddy state={isSaved ? 'saved' : 'result'} />
        </div>

        <div className="result-figure">
          <LineStack lines={record.line_values} />
        </div>

        <div className="trigram-facts" aria-label="上下卦与变化">
          <div className="fact-row">
            <span className="fact-symbol">{upperTrigram.symbol}</span>
            <strong>上卦：{upperTrigram.name}</strong>
            <small>象为{upperTrigram.nature}，德为{upperTrigram.virtue}</small>
          </div>
          <div className="fact-row">
            <span className="fact-symbol">{lowerTrigram.symbol}</span>
            <strong>下卦：{lowerTrigram.name}</strong>
            <small>象为{lowerTrigram.nature}，德为{lowerTrigram.virtue}</small>
          </div>
          <div className="fact-row">
            <strong>动爻：{changingLineLabels.length > 0 ? changingLineLabels.join('、') : '无'}</strong>
            <small>{changingLineLabels.length > 0 ? '象有变化，观其所趋' : '此卦无动，主象稳定'}</small>
          </div>
          <div className="fact-row">
            <strong>变卦：{changedHexagram ? `${changedHexagram.name} ${changedHexagram.unicode}` : '无'}</strong>
            <small>{changedHexagram ? '动爻变化后所成之卦' : '本卦主象稳定'}</small>
          </div>
        </div>

        {record.special_rule && (
          <p className="special-rule">
            <strong>{record.special_rule}</strong>
            {record.special_rule === '用九' ? '：见群龙无首，吉。' : '：利永贞。'}
          </p>
        )}

        <article className="meaning-section">
          <h3>原卦全意</h3>
          <p>{baseHexagram.whole_image}</p>
        </article>

        <article className="weather-section">
          <h3>今日气象</h3>
          <p>{weather}</p>
        </article>

        <div className="result-actions">
          <button className="secondary-button" type="button" onClick={onSave} disabled={isSaved}>
            {isSaved ? '已收入卦匣' : '收藏卦签'}
          </button>
          <button className="primary-button" type="button" onClick={onRestart}>再起一卦</button>
        </div>

        {isSaved && <p className="save-confirmation" role="status">此卦已收入卦匣</p>}
      </div>
    </section>
  )
}
