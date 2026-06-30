import type { SavedCast } from './domain/types'

interface SavedCastListProps {
  casts: SavedCast[]
  onClose: () => void
  onDelete: (id: string) => void
}

export function SavedCastList({ casts, onClose, onDelete }: SavedCastListProps) {
  return (
    <aside className="archive-panel" role="dialog" aria-modal="true" aria-labelledby="archive-title">
      <div className="archive-panel__header">
        <div>
          <p>APEX STUDIO</p>
          <h2 id="archive-title">卦匣</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="关闭卦匣">关闭</button>
      </div>

      {casts.length === 0 ? (
        <div className="archive-empty">
          <span aria-hidden="true">□</span>
          <p>尚未收藏卦签</p>
          <small>完成一次起卦后，可将结果收入这里。</small>
        </div>
      ) : (
        <ul className="archive-list">
          {casts.map((saved) => (
            <li key={saved.cast.id}>
              <div>
                <time dateTime={saved.saved_at}>
                  {new Date(saved.saved_at).toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short' })}
                </time>
                <strong>{saved.base_hexagram.name} {saved.base_hexagram.unicode}</strong>
                <p>动爻：{saved.cast.changing_lines.length > 0 ? saved.cast.changing_lines.join('、') : '无'} · 变卦：{saved.changed_hexagram?.name ?? '无'}</p>
              </div>
              <button type="button" onClick={() => onDelete(saved.cast.id)} aria-label={`删除${saved.base_hexagram.name}卦签`}>
                删除
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
